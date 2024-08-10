import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { TransactionNotFound } from '../transaction-errors';
import { TransactionService } from '../transaction.service';

export type CancelTransactionCommand = {
  transactionId: string;
  memberId: string;
};

export class CancelTransaction implements CommandHandler<CancelTransactionCommand> {
  static inject = injectableClass(this, TOKENS.date, TOKENS.database, TOKENS.transactionService);

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
    private readonly transactionService: TransactionService,
  ) {}

  async handle(command: CancelTransactionCommand): Promise<void> {
    const { transactionId, memberId } = command;

    const transaction = await this.database.db.query.transactions.findFirst({
      where: eq(schema.transactions.id, transactionId),
    });

    if (!transaction) {
      throw new TransactionNotFound(transactionId);
    }

    const now = this.dateAdapter.now();

    this.transactionService.checkCanCancelTransaction({ transaction, memberId });

    this.transactionService.cancelTransaction({ transaction });

    await this.database.db
      .update(schema.transactions)
      .set({ ...transaction, updatedAt: now })
      .where(eq(schema.transactions.id, transaction.id));
  }
}
