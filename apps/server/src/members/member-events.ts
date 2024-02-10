import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { DomainEvent } from '../domain-event';

class MemberEvent extends DomainEvent {
  entity = 'member';
}

export class MemberCreated extends MemberEvent {}

export class AuthenticationLinkRequested extends MemberEvent {
  constructor(
    memberId: string,
    public readonly link: string,
  ) {
    super(memberId);
  }
}

export class MemberAuthenticated extends MemberEvent {}

export class MemberUnauthenticated extends MemberEvent {}

export class OnboardingCompleted extends MemberEvent {}

export class NotificationDeliveryTypeChanged extends MemberEvent {
  constructor(
    memberId: string,
    public readonly deliveryType: Partial<Record<NotificationDeliveryType, boolean>>,
  ) {
    super(memberId);
  }
}
