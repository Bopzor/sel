import { DomainError } from 'src/infrastructure/domain-error';
import { DomainEvent } from 'src/infrastructure/events';
import { HttpStatus } from 'src/infrastructure/http';
import { schema } from 'src/persistence';

export type Interest = typeof schema.interests.$inferSelect;
export type InterestInsert = typeof schema.interests.$inferInsert;

export type MemberInterest = typeof schema.membersInterests.$inferSelect;

export class InterestAlreadyAddedError extends DomainError {
  status = HttpStatus.badRequest;

  constructor() {
    super(`Interest was already added`);
  }
}

export class InterestNotAddedError extends DomainError {
  status = HttpStatus.badRequest;

  constructor() {
    super('Interest was not added');
  }
}

export class InterestEvent<Payload = never> extends DomainEvent<Payload> {
  entity = 'interest';
}

export class InterestCreatedEvent extends InterestEvent {}

export class InterestMemberEvent extends InterestEvent<{ memberId: string }> {
  constructor(interestId: string, memberId: string) {
    super(interestId, { memberId });
  }
}

export class InterestMemberAddedEvent extends InterestMemberEvent {}

export class InterestMemberEditedEvent extends InterestMemberEvent {}

export class InterestMemberRemovedEvent extends InterestMemberEvent {}
