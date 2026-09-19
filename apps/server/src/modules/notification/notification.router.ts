import * as shared from '@sel/shared';
import express from 'express';

import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db } from 'src/persistence';

import { registerDevice } from './domain/register-device.command';

export const router = express.Router();

router.post('/register-device', async (req, res) => {
  const member = getAuthenticatedMember();
  const { subscription, deviceType } = shared.registerDeviceBodySchema.parse(req.body);
  const deviceSubscription = JSON.stringify(subscription);

  const device = await db.query.memberDevices.findFirst({
    where: { deviceSubscription },
  });

  if (device === undefined) {
    await registerDevice({
      memberId: member.id,
      deviceSubscription,
      deviceType,
    });
  }

  res.status(HttpStatus.noContent).end();
});
