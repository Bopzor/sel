import { injectableClass } from 'ditox';

import { GeneratorPort } from '../../infrastructure/generator/generator.port';
import {
  PushDeviceSubscription,
  DeviceType,
} from '../../infrastructure/push-notification/push-notification.port';
import { MemberDeviceRepository } from '../../persistence/repositories/member-device/member-device.repository';
import { TOKENS } from '../../tokens';

export type RegisterDeviceCommand = {
  memberId: string;
  deviceSubscription: PushDeviceSubscription;
  deviceType: DeviceType;
};

export class RegisterDevice {
  static inject = injectableClass(this, TOKENS.generator, TOKENS.memberDeviceRepository);

  constructor(
    private readonly generator: GeneratorPort,
    private readonly memberDeviceRepository: MemberDeviceRepository
  ) {}

  async handle({ memberId, deviceSubscription, deviceType }: RegisterDeviceCommand): Promise<void> {
    await this.memberDeviceRepository.register({
      id: this.generator.id(),
      memberId,
      deviceSubscription,
      deviceType,
    });
  }
}
