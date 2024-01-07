import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { SessionProvider } from '../session/session.provider';
import { TOKENS } from '../tokens';

import { NotificationRepository } from './notification.repository';

export class NotificationsController {
  readonly router = Router();

  static inject = injectableClass(this, TOKENS.sessionProvider, TOKENS.notificationRepository);

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly notificationRepository: NotificationRepository
  ) {
    this.router.use(this.authenticated);
    this.router.get('/', this.getNotifications);
  }

  authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  getNotifications: RequestHandler = async (req, res) => {
    const member = this.sessionProvider.getMember();
    const notifications = await this.notificationRepository.getNotificationsForMember(member.id);

    res.status(200).json(notifications);
  };
}
