import { injectableClass } from 'ditox';
import { SQL, and, eq } from 'drizzle-orm';

import { DatePort } from '../../../infrastructure/date/date.port';
import { Subscription, SubscriptionType } from '../../../notifications/subscription.entity';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { subscriptions } from '../../schema';

import { InsertSubscriptionModel, SubscriptionRepository } from './subscription.repository';

export class SqlSubscriptionRepository implements SubscriptionRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

  async hasSubscription(
    type: string,
    memberId: string,
    entity?: { type: 'request'; id: string } | undefined
  ): Promise<boolean> {
    let where: SQL<unknown> | undefined = eq(subscriptions.type, type);

    where = and(where, eq(subscriptions.memberId, memberId));

    if (entity && entity.type === 'request') {
      where = and(where, eq(subscriptions.requestId, entity.id));
    }

    const [subscription] = await this.database.db.select().from(subscriptions).where(where);

    return subscription !== undefined;
  }

  async getSubscriptionsByType(type: SubscriptionType): Promise<Subscription[]> {
    const sqlSubscriptions = await this.database.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.type, type));

    return sqlSubscriptions.map(
      (subscription): Subscription => ({
        id: subscription.id,
        type: subscription.type as SubscriptionType,
        active: subscription.active,
        memberId: subscription.memberId,
      })
    );
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
}
