import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { ConfigPort } from '../../infrastructure/config/config.port';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { EmailRendererPort } from '../../infrastructure/email/email-renderer.port';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { SubscriptionService } from '../../notifications/subscription.service';
import { Database } from '../../persistence/database';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { TransactionCanceled } from '../transaction-events';

export class NotifyTransactionCanceled implements EventHandler<TransactionCanceled> {
  static inject = injectableClass(
    this,
    TOKENS.config,
    TOKENS.translation,
    TOKENS.memberRepository,
    TOKENS.subscriptionService,
    TOKENS.emailRenderer,
    TOKENS.database,
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly translation: TranslationPort,
    private readonly memberRepository: MemberRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly emailRenderer: EmailRendererPort,
    private readonly database: Database,
  ) {}

  private get appBaseUrl(): string {
    return this.config.app.baseUrl;
  }

  async handle(event: TransactionCanceled): Promise<void> {
    const transaction = await this.database.db.query.transactions.findFirst({
      where: eq(schema.transactions.id, event.entityId),
    });
    assert(transaction);

    const payer = await this.memberRepository.getMember(transaction.payerId);
    assert(payer);

    const recipient = await this.memberRepository.getMember(transaction.recipientId);
    assert(recipient);

    const config = await this.database.db.query.config.findFirst();
    assert(config !== undefined);

    const payerName = this.translation.memberName(payer);
    const link = `${this.appBaseUrl}/profile/transactions`;

    await this.subscriptionService.notify({
      subscriptionType: 'TransactionEvent',
      notificationType: 'TransactionCanceled',
      notificationEntityId: transaction.id,

      data: (member) => {
        const t = this.translation;

        const context = {
          payerName,
          description: transaction.description,
          currency: config.currencyPlural,
        };

        return {
          shouldSend: member.id === recipient.id,

          title: t.translate('transactionCanceled.title', context),

          push: {
            title: t.notificationTitle('transactionCanceled.push.title', 'payerName', { payerName }),
            content: t.translate('transactionCanceled.push.content', context),
            link,
          },

          email: this.emailRenderer.render({
            subject: t.translate('transactionCanceled.email.subject', context),
            html: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate('transactionCanceled.email.html.line1', context),
            ],
            text: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate('transactionCanceled.email.text.line1', context),
            ],
          }),
        };
      },
    });
  }
}
