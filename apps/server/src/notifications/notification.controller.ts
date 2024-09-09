import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { SessionProvider } from '../authentication/session.provider';
import { HttpStatus } from '../http-status';
import { CommandBus } from '../infrastructure/cqs/command-bus';
import { COMMANDS, TOKENS } from '../tokens';

export class NotificationController {
  static inject = injectableClass(this, TOKENS.commandBus, TOKENS.sessionProvider);

  readonly router = Router();

  constructor(
    private readonly commandBud: CommandBus,
    private readonly sessionProvider: SessionProvider,
  ) {
    this.router.post('/register-device', this.registerMemberDevice);
  }

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
