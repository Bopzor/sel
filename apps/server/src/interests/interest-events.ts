import { DomainEvent } from '../domain-event';

export class InterestEvent extends DomainEvent {
  entity = 'interest';
}

export class InterestCreated extends InterestEvent {}

export class InterestMemberEvent extends InterestEvent {
  constructor(
    interestId: string,
    public readonly memberId: string,
  ) {
    super(interestId);
  }
}

export class InterestMemberAdded extends InterestMemberEvent {}

export class InterestMemberRemoved extends InterestMemberEvent {}
