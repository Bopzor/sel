import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Interest = typeof schema.interests.$inferSelect;
export type InterestInsert = typeof schema.interests.$inferInsert;

export type MemberInterest = typeof schema.membersInterests.$inferSelect;

export class InterestCreatedEvent extends DomainEvent {}

export class InterestUpdatedEvent extends DomainEvent {}

export class InterestMemberEvent extends DomainEvent<{ memberId: string }> {}

export class InterestMemberAddedEvent extends InterestMemberEvent {}

export class InterestMemberEditedEvent extends InterestMemberEvent {}

export class InterestMemberRemovedEvent extends InterestMemberEvent {}
