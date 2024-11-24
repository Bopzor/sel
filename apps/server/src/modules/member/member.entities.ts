import { DomainEvent } from 'src/infrastructure/events';
import { type schema } from 'src/persistence';

import { NotificationDeliveryType } from '../notification/notification.entities';

export type Member = typeof schema.members.$inferSelect;
export type MemberInsert = typeof schema.members.$inferInsert;

export class MemberCreatedEvent extends DomainEvent {}

export class OnboardingCompletedEvent extends DomainEvent {}

export class NotificationDeliveryTypeChangedEvent extends DomainEvent<{
  notificationDeliveryType: Partial<Record<NotificationDeliveryType, boolean>>;
}> {}
