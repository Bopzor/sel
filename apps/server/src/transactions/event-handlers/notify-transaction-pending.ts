import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { NotificationService } from '../../notifications/notification.service';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { TransactionPending } from '../transaction-events';

export class NotifyTransactionPending implements EventHandler<TransactionPending> {
  static inject = injectableClass(this, TOKENS.translation, TOKENS.notificationService, TOKENS.database);

  constructor(
    private readonly translation: TranslationPort,
    private readonly notificationService: NotificationService,
    private readonly database: Database,
  ) {}

  async handle(event: TransactionPending): Promise<void> {
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

    await this.notificationService.notify([transaction.payer.id], 'TransactionPending', (member) => ({
      member: {
        firstName: member.firstName,
      },
      transaction: {
        id: transaction.id,
        description: transaction.description,
        recipient: {
          id: transaction.recipient.id,
          name: this.translation.memberName(transaction.recipient),
        },
      },
      currency: config.currencyPlural,
      currencyAmount: this.translation.translate('currencyAmount', {
        amount: transaction.amount,
        currency: config.currency,
        currencyPlural: config.currencyPlural,
      }),
    }));
  }
}
