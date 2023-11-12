import { DomainEvent } from '../domain-event';

class MemberEvent extends DomainEvent {
  entity = 'member';
}

export class AuthenticationLinkRequested extends MemberEvent {
  constructor(entityId: string, public readonly link: string) {
    super(entityId);
  }
}

export class MemberAuthenticated extends MemberEvent {}

export class MemberUnauthenticated extends MemberEvent {}

export class OnboardingCompleted extends MemberEvent {}
