import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { AuthenticationFacade } from '../authentication/authentication.facade';
import { HttpStatus } from '../http-status';
import { MembersFacade } from '../members/members.facade';
import { SubscriptionFacade } from '../notifications/subscription.facade';
import { TOKENS } from '../tokens';

import { SessionProvider } from './session.provider';

export class SessionController {
  static inject = injectableClass(
    this,
    TOKENS.sessionProvider,
    TOKENS.authenticationFacade,
    TOKENS.membersFacade,
    TOKENS.subscriptionFacade
  );

  readonly router = Router();

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly authenticationFacade: AuthenticationFacade,
    private readonly membersFacade: MembersFacade,
    private readonly subscriptionFacade: SubscriptionFacade
  ) {
    this.router.delete('/', this.deleteCurrentSession);
    this.router.get('/member', this.getCurrentMember);
    this.router.get('/notifications', this.getMemberNotifications);
    this.router.put('/notifications/:notificationId/read', this.markNotificationAsRead);
  }

  deleteCurrentSession: RequestHandler = async (req, res) => {
    this.sessionProvider.getMember();

    await this.authenticationFacade.revokeSessionToken(req.cookies['token']);

    const setCookie = [`token=`, `Max-Age=0`, 'HttpOnly', 'Path=/', 'SameSite=Lax'];

    res.header('Set-Cookie', setCookie.join(';'));
    res.status(HttpStatus.noContent).end();
  };

  getCurrentMember: RequestHandler<never, shared.AuthenticatedMember> = async (req, res) => {
    const member = this.sessionProvider.getMember();

    res.json(await this.membersFacade.query_getAuthenticatedMember(member.id));
  };

  getMemberNotifications: RequestHandler<never, shared.Notification[]> = async (req, res) => {
    const member = this.sessionProvider.getMember();

    const unreadCount = await this.subscriptionFacade.query_countNotifications(member.id, false);
    const notifications = await this.subscriptionFacade.query_getNotifications(member.id);

    res.header('X-Unread-Notifications-Count', String(unreadCount));
    res.json(notifications);
  };

  markNotificationAsRead: RequestHandler<{ notificationId: string }> = async (req, res) => {
    const member = this.sessionProvider.getMember();

    await this.subscriptionFacade.markNotificationAsRead(req.params.notificationId, member.id);

    res.status(HttpStatus.noContent).end();
  };
}
