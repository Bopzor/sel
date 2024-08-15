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
import { TransactionPending } from '../transaction-events';

export class NotifyTransactionPending implements EventHandler<TransactionPending> {
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

  async handle(event: TransactionPending): Promise<void> {
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

    const recipientName = this.translation.memberName(recipient);
    const link = `${this.appBaseUrl}/profile/transactions?transactionId=${transaction.id}`;

    await this.subscriptionService.notify({
      subscriptionType: 'TransactionEvent',
      notificationType: 'TransactionPending',
      notificationEntityId: transaction.id,

      data: (member) => {
        const t = this.translation;

        const context = {
          recipientName,
          description: transaction.description,
          currency: config.currencyPlural,
          amount: t.translate('currencyAmount', {
            amount: transaction.amount,
            currency: config.currency,
            currencyPlural: config.currencyPlural,
          }),
          link: (children: string[]) => `<a href="${link}">${children}</a>`,
          linkText: link,
        };

        return {
          shouldSend: member.id === payer.id,

          title: t.translate('transactionPending.title', context),

          push: {
            title: t.notificationTitle('transactionPending.push.title', 'recipientName', { recipientName }),
            content: t.translate('transactionPending.push.content', context),
            link,
          },

          email: this.emailRenderer.render({
            subject: t.translate('transactionPending.email.subject', context),
            html: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate('transactionPending.email.html.line1', context),
              t.translate('transactionPending.email.html.line2', context),
            ],
            text: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate('transactionPending.email.text.line1', context),
              t.translate('transactionPending.email.text.line2', context),
            ],
          }),
        };
      },
    });
  }
}
