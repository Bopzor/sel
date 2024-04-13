import { injectableClass } from 'ditox';
import { SQL, and, eq, inArray } from 'drizzle-orm';

import { DatePort } from '../../../infrastructure/date/date.port';
import { Subscription, SubscriptionType } from '../../../notifications/subscription.entity';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { subscriptions } from '../../schema';

import {
  GetSubscriptionsFilters,
  InsertSubscriptionModel,
  SubscriptionRepository,
} from './subscription.repository';

export class SqlSubscriptionRepository implements SubscriptionRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(
    private readonly database: Database,
    private readonly dateAdapter: DatePort,
  ) {}

  async hasSubscription(type: string, memberId: string, entityId?: string): Promise<boolean> {
    let where: SQL<unknown> | undefined = eq(subscriptions.type, type);

    where = and(where, eq(subscriptions.memberId, memberId));

    if (entityId) {
      where = and(where, eq(subscriptions.entityId, entityId));
    }

    const [subscription] = await this.database.db.select().from(subscriptions).where(where);

    return subscription !== undefined;
  }

  async getSubscriptions({ type, entityId, memberId }: GetSubscriptionsFilters): Promise<Subscription[]> {
    let where: SQL<unknown> | undefined = undefined;

    if (type) {
      where = and(where, eq(subscriptions.type, type));
    }

    if (entityId) {
      where = and(where, eq(subscriptions.entityId, entityId));
    }

    if (memberId) {
      where = and(where, eq(subscriptions.memberId, memberId));
    }

    const sqlSubscriptions = await this.database.db.select().from(subscriptions).where(where);

    return sqlSubscriptions.map(this.toSubscription);
  }

  async insert(model: InsertSubscriptionModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db.insert(subscriptions).values({
      id: model.id,
      active: model.active ?? true,
      type: model.type,
      memberId: model.memberId,
      entityId: model.entityId,
      createdAt: now,
      updatedAt: now,
    });
  }

  async enable(subscriptionIds: string[]): Promise<void> {
    await this.database.db
      .update(subscriptions)
      .set({ active: true })
      .where(inArray(subscriptions.id, subscriptionIds));
  }

  private toSubscription(this: void, sqlSubscription: typeof subscriptions.$inferSelect): Subscription {
    return {
      id: sqlSubscription.id,
      type: sqlSubscription.type as SubscriptionType,
      active: sqlSubscription.active,
      memberId: sqlSubscription.memberId,
    };
  }
}
