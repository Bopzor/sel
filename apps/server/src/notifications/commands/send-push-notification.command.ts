import { injectableClass } from 'ditox';

import { PushNotificationPort } from '../../infrastructure/push-notification/push-notification.port';
import { MemberDeviceRepository } from '../../persistence/repositories/member-device/member-device.repository';
import { TOKENS } from '../../tokens';

export type SendPushNotificationCommand = {
  memberId: string;
  title: string;
  content: string;
};

export class SendPushNotification {
  static inject = injectableClass(this, TOKENS.pushNotification, TOKENS.memberDeviceRepository);

  constructor(
    private readonly pushNotification: PushNotificationPort,
    private readonly memberDeviceRepository: MemberDeviceRepository
  ) {}

  async handle({ memberId, title, content }: SendPushNotificationCommand) {
    const subscriptions = await this.memberDeviceRepository.getMemberDeviceSubscriptions(memberId);

    await Promise.all(
      subscriptions.map(async (subscription) => {
        await this.pushNotification.send(subscription, title, content);
      })
    );
  }
}
