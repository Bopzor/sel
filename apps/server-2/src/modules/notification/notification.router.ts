import * as shared from '@sel/shared';
import express from 'express';

import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';

import { registerDevice } from './domain/register-device.command';

const router = express.Router();

router.post('/register-device', async (req, res) => {
  const member = getAuthenticatedMember();
  const { subscription, deviceType } = shared.registerDeviceBodySchema.parse(req.body);

  await registerDevice({
    memberId: member.id,
    deviceSubscription: subscription,
    deviceType,
  });

  res.status(HttpStatus.noContent).end();
});
