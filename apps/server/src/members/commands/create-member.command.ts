import { injectableClass } from 'ditox';

import { NotificationDeliveryType } from '../../common/notification-delivery-type';
import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';
import { MemberCreated } from '../member-events';

export type CreateMemberCommand = {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export class CreateMember implements CommandHandler<CreateMemberCommand> {
  static inject = injectableClass(this, TOKENS.memberRepository, TOKENS.eventPublisher);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async handle({ memberId, firstName, lastName, email }: CreateMemberCommand): Promise<void> {
    await this.memberRepository.insert({
      id: memberId,
      firstName,
      lastName,
      email,
      notificationDelivery: {
        [NotificationDeliveryType.email]: false,
        [NotificationDeliveryType.push]: false,
      },
    });

    this.eventPublisher.publish(new MemberCreated(memberId));
  }
}
