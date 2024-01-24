import { injectableClass } from 'ditox';

import { GeneratorPort } from '../infrastructure/generator/generator.port';
import {
  DeviceType,
  PushDeviceSubscription,
  PushNotificationPort,
} from '../infrastructure/push-notification/push-notification.port';
import { MemberDeviceRepository } from '../persistence/repositories/member-device/member-device.repository';
import { TOKENS } from '../tokens';

export class PushNotificationService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.pushNotification,
    TOKENS.memberDeviceRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly pushNotification: PushNotificationPort,
    private readonly memberDeviceRepository: MemberDeviceRepository
  ) {}

  async registerDevice(
    memberId: string,
    deviceSubscription: PushDeviceSubscription,
    deviceType: DeviceType
  ): Promise<void> {
    await this.memberDeviceRepository.register({
      id: this.generator.id(),
      memberId,
      deviceSubscription,
      deviceType,
    });
  }

  async sendPushNotification(memberId: string, title: string, content: string) {
    const subscriptions = await this.memberDeviceRepository.getMemberDeviceSubscriptions(memberId);

    await Promise.all(
      subscriptions.map(async (subscription) => {
        await this.pushNotification.send(subscription, title, content);
      })
    );
  }
}
