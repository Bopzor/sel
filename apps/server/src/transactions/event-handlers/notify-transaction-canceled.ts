import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { NotificationService } from '../../notifications/notification.service';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { TransactionCanceled } from '../transaction-events';

export class NotifyTransactionCanceled implements EventHandler<TransactionCanceled> {
  static inject = injectableClass(this, TOKENS.translation, TOKENS.notificationService, TOKENS.database);

  constructor(
    private readonly translation: TranslationPort,
    private readonly notificationService: NotificationService,
    private readonly database: Database,
  ) {}

  async handle(event: TransactionCanceled): Promise<void> {
    const transaction = defined(
      await this.database.db.query.transactions.findFirst({
        where: eq(schema.transactions.id, event.entityId),
        with: {
          payer: true,
          recipient: true,
        },
      }),
    );

    const config = defined(await this.database.db.query.config.findFirst());

    await this.notificationService.notify([transaction.recipient.id], 'TransactionCanceled', (member) => ({
      member: {
        firstName: member.firstName,
      },
      transaction: {
        id: transaction.id,
        description: transaction.description,
        payer: {
          id: transaction.payer.id,
          name: this.translation.memberName(transaction.payer),
        },
      },
      currency: config.currencyPlural,
    }));
  }
}
