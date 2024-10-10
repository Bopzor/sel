import { DomainEvent } from 'src/infrastructure/events';
import { type schema } from 'src/persistence';

export enum MemberStatus {
  onboarding = 'onboarding',
  inactive = 'inactive',
  active = 'active',
}

export type Member = typeof schema.members.$inferSelect;
export type MemberInsert = typeof schema.members.$inferInsert;

export class MemberCreatedEvent extends DomainEvent {}

export class OnboardingCompletedEvent extends DomainEvent {}
