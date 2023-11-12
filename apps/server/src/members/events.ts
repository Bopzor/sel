import { DomainEvent } from '../domain-event';

export class AuthenticationLinkRequested implements DomainEvent {
  public readonly entity = 'member';

  constructor(public readonly entityId: string, public readonly link: string) {}
}
