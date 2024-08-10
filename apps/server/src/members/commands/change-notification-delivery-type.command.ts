import { injectableClass } from 'ditox';

import { NotificationDeliveryType } from '../../common/notification-delivery-type';
import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';
import { NotificationDeliveryTypeChanged } from '../member-events';

export type ChangeNotificationDeliveryTypeCommand = {
  memberId: string;
  notificationDeliveryType: Partial<Record<NotificationDeliveryType, boolean>>;
};

export class ChangeNotificationDeliveryType implements CommandHandler<ChangeNotificationDeliveryTypeCommand> {
  static inject = injectableClass(this, TOKENS.eventPublisher, TOKENS.memberRepository);

  constructor(
    private readonly eventPublisher: EventPublisherPort,
    private readonly memberRepository: MemberRepository,
  ) {}

  async handle(command: ChangeNotificationDeliveryTypeCommand): Promise<void> {
    const member = await this.memberRepository.getMemberOrFail(command.memberId);

    await this.memberRepository.setNotificationDelivery(member.id, command.notificationDeliveryType);

    this.eventPublisher.publish(
      new NotificationDeliveryTypeChanged(member.id, command.notificationDeliveryType),
    );
  }
}
