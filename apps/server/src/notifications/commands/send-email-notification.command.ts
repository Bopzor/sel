import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EmailSenderPort } from '../../infrastructure/email/email-sender.port';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { NotificationRepository } from '../../persistence/repositories/notification/notification.repository';
import { TOKENS } from '../../tokens';

export type SendEmailNotificationCommand = {
  notificationId: string;
};

export class SendEmailNotification implements CommandHandler<SendEmailNotificationCommand> {
  static inject = injectableClass(
    this,
    TOKENS.emailSender,
    TOKENS.memberRepository,
    TOKENS.notificationRepository,
  );

  constructor(
    private readonly emailSender: EmailSenderPort,
    private readonly memberRepository: MemberRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async handle({ notificationId }: SendEmailNotificationCommand) {
    const notification = await this.getNotification(notificationId);
    const member = await this.getMember(notification.memberId);

    await this.emailSender.send({
      to: member.email,
      ...notification.email,
    });
  }

  private async getNotification(notificationId: string) {
    return defined(await this.notificationRepository.getNotification(notificationId));
  }

  private async getMember(memberId: string) {
    return defined(await this.memberRepository.getMember(memberId));
  }
}
