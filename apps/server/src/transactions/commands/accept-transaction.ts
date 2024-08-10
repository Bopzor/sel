import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { Database } from '../../persistence/database';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { TransactionNotFound } from '../transaction-errors';
import { TransactionService } from '../transaction.service';

export type AcceptTransactionCommand = {
  transactionId: string;
  memberId: string;
};

export class AcceptTransaction implements CommandHandler<AcceptTransactionCommand> {
  static inject = injectableClass(
    this,
    TOKENS.date,
    TOKENS.database,
    TOKENS.memberRepository,
    TOKENS.transactionService,
  );

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
    private readonly memberRepository: MemberRepository,
    private readonly transactionService: TransactionService,
  ) {}

  async handle(command: AcceptTransactionCommand): Promise<void> {
    const { transactionId, memberId } = command;

    const transaction = await this.database.db.query.transactions.findFirst({
      where: eq(schema.transactions.id, transactionId),
    });

    if (!transaction) {
      throw new TransactionNotFound(transactionId);
    }

    const payer = await this.memberRepository.getMemberOrFail(transaction.payerId);
    const recipient = await this.memberRepository.getMemberOrFail(transaction.recipientId);
    const now = this.dateAdapter.now();

    this.transactionService.checkCanAcceptTransaction({ transaction, memberId });

    this.transactionService.completeTransaction({
      transaction,
      payer,
      recipient,
    });

    await this.database.db
      .update(schema.transactions)
      .set({ ...transaction, updatedAt: now })
      .where(eq(schema.transactions.id, transaction.id));

    for (const { id, balance } of [payer, recipient]) {
      await this.database.db
        .update(schema.members)
        .set({ balance: balance, updatedAt: now })
        .where(eq(schema.members.id, id));
    }
  }
}
