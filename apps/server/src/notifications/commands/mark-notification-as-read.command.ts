import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { MemberIsNotNotificationRecipient, NotificationNotFound } from '../notification-errors';

export type MarkNotificationAsReadCommand = {
  notificationId: string;
  memberId: string;
};

export class MarkNotificationAsRead implements CommandHandler<MarkNotificationAsReadCommand> {
  static inject = injectableClass(this, TOKENS.date, TOKENS.database);

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
  ) {}

  async handle({ memberId, notificationId }: MarkNotificationAsReadCommand): Promise<void> {
    const notification = await this.database.db.query.notifications2.findFirst({
      where: eq(schema.notifications2.id, notificationId),
    });

    if (!notification) {
      throw new NotificationNotFound(notificationId);
    }

    if (notification.memberId !== memberId) {
      throw new MemberIsNotNotificationRecipient(notificationId);
    }

    await this.database.db
      .update(schema.notifications2)
      .set({ readAt: this.dateAdapter.now() })
      .where(eq(schema.notifications2.id, notificationId));
  }
}
