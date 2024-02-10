import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { NotificationRepository } from '../../persistence/repositories/notification/notification.repository';
import { COMMANDS, TOKENS } from '../../tokens';
import { NotificationCreated } from '../notification-events';

export class DeliverNotification implements EventHandler<NotificationCreated> {
  static inject = injectableClass(this, TOKENS.commandBus, TOKENS.notificationRepository);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async handle(event: NotificationCreated): Promise<void> {
    const notification = await this.getNotification(event.entityId);

    if (notification.deliveryType.push) {
      await this.commandBus.executeCommand(COMMANDS.sendPushNotification, {
        memberId: notification.memberId,
        title: notification.titleTrimmed,
        content: notification.content,
      });
    }

    if (notification.deliveryType.email) {
      await this.commandBus.executeCommand(COMMANDS.sendEmailNotification, {
        notificationId: notification.id,
      });
    }
  }

  private async getNotification(notificationId: string) {
    return defined(await this.notificationRepository.getNotification(notificationId));
  }
}
