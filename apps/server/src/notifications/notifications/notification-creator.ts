import { SubscriptionEntityType } from '../subscription.entity';

export interface NotificationCreator {
  entity?(): { type: SubscriptionEntityType; id: string };
  shouldSend(memberId: string): boolean;
  title(): string;
  titleTrimmed(): string;
  content(): string;
}
