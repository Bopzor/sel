import { injectableClass } from 'ditox';

import { GeneratorPort } from '../infrastructure/generator/generator.port';
import {
  PushDeviceSubscription,
  PushNotificationPort,
} from '../infrastructure/push-notification/push-notification.port';
import { TOKENS } from '../tokens';

import { MemberDeviceRepository } from './member-device.repository';

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

  async registerDevice(memberId: string, deviceSubscription: PushDeviceSubscription): Promise<void> {
    await this.memberDeviceRepository.register({
      id: this.generator.id(),
      memberId,
      deviceSubscription,
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
