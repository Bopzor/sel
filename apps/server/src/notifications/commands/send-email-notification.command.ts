import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EmailSenderPort } from '../../infrastructure/email/email-sender.port';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { NotificationRepository } from '../../persistence/repositories/notification/notification.repository';
import { TOKENS } from '../../tokens';

export type SendEmailNotificationCommand = {
  notificationId: string;
};

export class SendEmailNotification implements CommandHandler<SendEmailNotificationCommand> {
  static inject = injectableClass(
    this,
    TOKENS.translation,
    TOKENS.emailSender,
    TOKENS.memberRepository,
    TOKENS.notificationRepository
  );

  constructor(
    private readonly translation: TranslationPort,
    private readonly emailSender: EmailSenderPort,
    private readonly memberRepository: MemberRepository,
    private readonly notificationRepository: NotificationRepository
  ) {}

  async handle({ notificationId }: SendEmailNotificationCommand) {
    const notification = await this.getNotification(notificationId);
    const member = await this.getMember(notification.memberId);

    await this.emailSender.send({
      to: member.email,
      kind: 'notification',
      subject: this.translation.translate('emailSubject', {
        prefix: this.translation.translate('emailSubjectPrefix'),
        subject: notification.title,
      }),
      variables: {
        firstName: member.firstName,
        title: notification.title,
        content: notification.content,
      },
    });
  }

  private async getNotification(notificationId: string) {
    return defined(await this.notificationRepository.getNotification(notificationId));
  }

  private async getMember(memberId: string) {
    return defined(await this.memberRepository.getMember(memberId));
  }
}
