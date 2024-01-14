import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { HttpStatus } from '../http-status';
import { SessionProvider } from '../session/session.provider';
import { TOKENS } from '../tokens';

import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';

export class NotificationController {
  static inject = injectableClass(
    this,
    TOKENS.sessionProvider,
    TOKENS.notificationService,
    TOKENS.notificationRepository
  );

  readonly router = Router();

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly notificationService: NotificationService,
    private readonly notificationRepository: NotificationRepository
  ) {
    this.router.get('/', this.getMemberNotifications);
    this.router.put('/:notificationId/read', this.markNotificationAsRead);
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
}
