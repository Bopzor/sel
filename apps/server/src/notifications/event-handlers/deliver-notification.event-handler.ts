import { injectableClass } from 'ditox';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { NotificationCreated } from '../notification-events';

export class DeliverNotification implements EventHandler<NotificationCreated> {
  static inject = injectableClass(this);

  async handle(event: NotificationCreated): Promise<void> {}
}
