import { DomainError } from 'src/infrastructure/domain-error';
import { DomainEvent } from 'src/infrastructure/events';
import { HttpStatus } from 'src/infrastructure/http';
import { schema } from 'src/persistence';

export type Interest = typeof schema.interests.$inferSelect;
export type InterestInsert = typeof schema.interests.$inferInsert;

export type MemberInterest = typeof schema.membersInterests.$inferSelect;

export class InterestCreatedEvent extends DomainEvent {}

export class InterestMemberEvent extends DomainEvent<{ memberId: string }> {}

export class InterestMemberAddedEvent extends InterestMemberEvent {}

export class InterestMemberEditedEvent extends InterestMemberEvent {}

export class InterestMemberRemovedEvent extends InterestMemberEvent {}

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
