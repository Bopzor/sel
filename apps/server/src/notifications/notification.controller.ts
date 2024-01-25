import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { SessionProvider } from '../authentication/session.provider';
import { HttpStatus } from '../http-status';
import { CommandBus } from '../infrastructure/cqs/command-bus';
import { QueryBus } from '../infrastructure/cqs/query-bus';
import { COMMANDS, QUERIES, TOKENS } from '../tokens';

export class NotificationController {
  static inject = injectableClass(this, TOKENS.queryBus, TOKENS.commandBus, TOKENS.sessionProvider);

  readonly router = Router();

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBud: CommandBus,
    private readonly sessionProvider: SessionProvider
  ) {
    this.router.get('/', this.getMemberNotifications);
    this.router.put('/:notificationId/read', this.markNotificationAsRead);
    this.router.post('/register-device', this.registerMemberDevice);
  }

  getMemberNotifications: RequestHandler<never, shared.Notification[]> = async (req, res) => {
    const member = this.sessionProvider.getMember();

    const { unreadCount, notifications } = await this.queryBus.executeQuery(QUERIES.getMemberNotifications, {
      memberId: member.id,
    });

    res.header('X-Unread-Notifications-Count', String(unreadCount));
    res.json(notifications);
  };

  markNotificationAsRead: RequestHandler<{ notificationId: string }> = async (req, res) => {
    const member = this.sessionProvider.getMember();

    await this.commandBud.executeCommand(COMMANDS.markNotificationAsRead, {
      notificationId: req.params.notificationId,
      memberId: member.id,
    });

    res.status(HttpStatus.noContent).end();
  };

  private static registerDeviceSchema = z.object({
    subscription: z.any(),
    deviceType: z.union([z.literal('mobile'), z.literal('desktop')]),
  });

  registerMemberDevice: RequestHandler = async (req, res) => {
    const member = this.sessionProvider.getMember();
    const { subscription, deviceType } = NotificationController.registerDeviceSchema.parse(req.body);

    await this.commandBud.executeCommand(COMMANDS.registerDevice, {
      memberId: member.id,
      deviceSubscription: subscription,
      deviceType,
    });

    res.status(HttpStatus.noContent).end();
  };
}
