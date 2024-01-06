import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { subscriptions } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { Subscription } from './entities';
import {
  InsertSubscriptionModel,
  SubscriptionEventType,
  SubscriptionRepository,
} from './subscription.repository';

export class SqlSubscriptionRepository implements SubscriptionRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

  async getSubscriptionsForEventType(eventType: SubscriptionEventType): Promise<Subscription[]> {
    const sqlSubscriptions = await this.database.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.eventType, eventType));

    return sqlSubscriptions.map(
      (subscription): Subscription => ({
        id: subscription.id,
        eventType: subscription.eventType as SubscriptionEventType,
        memberId: subscription.memberId,
      })
    );
  }

  async insert(model: InsertSubscriptionModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db.insert(subscriptions).values({
      id: model.id,
      active: true,
      eventType: model.eventType,
      memberId: model.memberId,
      [`${model.entityType}Id`]: model.entityId,
      createdAt: now,
      updatedAt: now,
    });
  }
}
