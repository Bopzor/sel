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

  async hasSubscription(
    type: string,
    memberId: string,
    entity?: { type: 'request'; id: string } | undefined,
  ): Promise<boolean> {
    let where: SQL<unknown> | undefined = eq(subscriptions.type, type);

    where = and(where, eq(subscriptions.memberId, memberId));

    if (entity && entity.type === 'request') {
      where = and(where, eq(subscriptions.requestId, entity.id));
    }

    const [subscription] = await this.database.db.select().from(subscriptions).where(where);

    return subscription !== undefined;
  }

  async getSubscriptions({ type, entity, memberId }: GetSubscriptionsFilters): Promise<Subscription[]> {
    let where: SQL<unknown> | undefined = undefined;

    if (type) {
      where = and(where, eq(subscriptions.type, type));
    }

    if (entity?.type === 'request') {
      where = and(where, eq(subscriptions.requestId, entity.id));
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
      [`${model.entityType}Id`]: model.entityId,
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
