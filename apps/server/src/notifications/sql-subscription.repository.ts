import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { subscriptions } from '../infrastructure/persistence/schema';

import { InsertSubscriptionModel, SubscriptionRepository } from './subscription.repository';

export class SqlSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

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
