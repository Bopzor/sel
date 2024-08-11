import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { Database } from '../../persistence/database';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { TransactionService } from '../transaction.service';

export type CreateTransactionCommand = {
  transactionId: string;
  payerId: string;
  recipientId: string;
  creatorId: string;
  amount: number;
  description: string;
  requestId?: string;
  eventId?: string;
};

export class CreateTransaction implements CommandHandler<CreateTransactionCommand> {
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

  async handle(command: CreateTransactionCommand): Promise<void> {
    const { transactionId, payerId, recipientId, creatorId, amount, description, requestId, eventId } =
      command;

    const payer = await this.memberRepository.getMemberOrFail(payerId);
    const recipient = await this.memberRepository.getMemberOrFail(recipientId);
    const creator = creatorId === payerId ? payer : recipient;
    const now = this.dateAdapter.now();

    const transaction = this.transactionService.createTransaction({
      transactionId,
      payer,
      recipient,
      creator,
      amount,
      description,
      requestId,
      eventId,
      now,
    });

    await this.database.db.insert(schema.transactions).values(transaction);

    for (const { id, balance } of [payer, recipient]) {
      await this.database.db
        .update(schema.members)
        .set({ balance: balance, updatedAt: now })
        .where(eq(schema.members.id, id));
    }
  }
}
