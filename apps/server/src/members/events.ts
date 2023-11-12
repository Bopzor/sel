import { DomainEvent } from '../domain-event';

export class AuthenticationLinkRequested implements DomainEvent {
  public readonly entity = 'member';

  constructor(public readonly entityId: string, public readonly link: string) {}
}

export class MemberAuthenticated implements DomainEvent {
  public readonly entity = 'member';

  constructor(public readonly entityId: string) {}
}

export class MemberUnauthenticated implements DomainEvent {
  public readonly entity = 'member';

  constructor(public readonly entityId: string) {}
}

export class OnboardingCompleted implements DomainEvent {
  public readonly entity = 'member';

  constructor(public readonly entityId: string) {}
}
