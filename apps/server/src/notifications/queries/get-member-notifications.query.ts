import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { desc, eq } from 'drizzle-orm';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';

export type GetMemberNotificationQuery = {
  memberId: string;
};

export type GetMemberNotificationQueryResult = shared.Notification[];

export class GetMemberNotifications
  implements QueryHandler<GetMemberNotificationQuery, GetMemberNotificationQueryResult>
{
  static inject = injectableClass(this, TOKENS.database);

  constructor(private readonly database: Database) {}

  async handle({ memberId }: GetMemberNotificationQuery): Promise<GetMemberNotificationQueryResult> {
    const notifications = await this.database.db.query.notifications.findMany({
      where: eq(schema.notifications.memberId, memberId),
      orderBy: desc(schema.notifications.date),
    });

    return notifications.map(this.mapNotification);
  }

  private mapNotification(
    this: void,
    notification: typeof schema.notifications.$inferSelect,
  ): shared.Notification {
    return {
      id: notification.id,
      type: notification.type,
      date: notification.date.toISOString(),
      context: notification.context,
    };
  }
}
