import { assert, hasProperty } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { ErrorReporterPort } from '../../infrastructure/error-reporter/error-reporter.port';
import { PushNotificationPort } from '../../infrastructure/push-notification/push-notification.port';
import { MemberDeviceRepository } from '../../persistence/repositories/member-device/member-device.repository';
import { TOKENS } from '../../tokens';

export type SendPushNotificationCommand = {
  memberId: string;
  title: string;
  content: string;
  link: string;
};

export class SendPushNotification implements CommandHandler<SendPushNotificationCommand> {
  static inject = injectableClass(
    this,
    TOKENS.errorReporter,
    TOKENS.pushNotification,
    TOKENS.memberDeviceRepository,
  );

  constructor(
    private readonly errorReporter: ErrorReporterPort,
    private readonly pushNotification: PushNotificationPort,
    private readonly memberDeviceRepository: MemberDeviceRepository,
  ) {}

  async handle({ memberId, title, content, link }: SendPushNotificationCommand) {
    const subscriptions = await this.memberDeviceRepository.getMemberDeviceSubscriptions(memberId);

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        await this.pushNotification.send(subscription, title, content, link);
      }),
    );

    for (const result of results.filter(hasProperty('status', 'rejected'))) {
      assert(result.status === 'rejected');
      void this.errorReporter.report(result.reason);
    }
  }
}
