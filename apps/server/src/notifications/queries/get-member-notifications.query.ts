import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { and, count, desc, eq, isNull } from 'drizzle-orm';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';

export type GetMemberNotificationQuery = {
  memberId: string;
};

export type GetMemberNotificationQueryResult = {
  unreadCount: number;
  notifications: shared.Notification[];
};

export class GetMemberNotifications
  implements QueryHandler<GetMemberNotificationQuery, GetMemberNotificationQueryResult>
{
  static inject = injectableClass(this, TOKENS.database);

  constructor(private readonly database: Database) {}

  async handle({ memberId }: GetMemberNotificationQuery): Promise<GetMemberNotificationQueryResult> {
    const [{ count: unreadCount }] = await this.database.db
      .select({ count: count() })
      .from(schema.notifications)
      .where(and(isNull(schema.notifications.readAt), eq(schema.notifications.memberId, memberId)));

    const notifications = await this.database.db.query.notifications.findMany({
      where: eq(schema.notifications.memberId, memberId),
      orderBy: desc(schema.notifications.date),
    });

    return {
      unreadCount,
      notifications: notifications.map(this.mapNotification),
    };
  }

  private mapNotification(
    this: void,
    notification: typeof schema.notifications.$inferSelect,
  ): shared.Notification {
    return {
      id: notification.id,
      type: notification.type as shared.NotificationType,
      // todo
      title: '',
      content: '',
      date: notification.date.toISOString(),
      read: notification.readAt !== null,
      context: notification.context,
    };
  }
}
