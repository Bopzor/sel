import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { HttpStatus } from '../http-status';
import { SessionProvider } from '../session/session.provider';
import { TOKENS } from '../tokens';

import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';
import { PushNotificationService } from './push-notification.service';

export class NotificationController {
  static inject = injectableClass(
    this,
    TOKENS.sessionProvider,
    TOKENS.notificationService,
    TOKENS.notificationRepository,
    TOKENS.pushNotificationService
  );

  readonly router = Router();

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly notificationService: NotificationService,
    private readonly notificationRepository: NotificationRepository,
    private readonly pushNotificationService: PushNotificationService
  ) {
    this.router.get('/', this.getMemberNotifications);
    this.router.put('/:notificationId/read', this.markNotificationAsRead);
    this.router.post('/register-device', this.registerMemberDevice);
  }

  getMemberNotifications: RequestHandler<never, shared.Notification[]> = async (req, res) => {
    const member = this.sessionProvider.getMember();

    const unreadCount = await this.notificationRepository.query_countNotificationsForMember(member.id, false);
    const notifications = await this.notificationRepository.query_getNotificationsForMember(member.id);

    res.header('X-Unread-Notifications-Count', String(unreadCount));
    res.json(notifications);
  };

  markNotificationAsRead: RequestHandler<{ notificationId: string }> = async (req, res) => {
    const member = this.sessionProvider.getMember();

    await this.notificationService.markAsRead(req.params.notificationId, member.id);

    res.status(HttpStatus.noContent).end();
  };

  private static registerDeviceSchema = z.object({
    subscription: z.any(),
  });

  registerMemberDevice: RequestHandler = async (req, res) => {
    const member = this.sessionProvider.getMember();
    const { subscription } = NotificationController.registerDeviceSchema.parse(req.body);

    await this.pushNotificationService.registerDevice(member.id, subscription);

    res.status(HttpStatus.noContent).end();
  };
}
