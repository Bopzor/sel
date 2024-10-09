import express from 'express';

import { unsetCookie } from 'src/infrastructure/cookie';
import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';

import { serializeMember } from '../member/member.router';

import { revokeSessionToken } from './revoke-session-token.command';

export const router = express.Router();

router.delete('/', async (req, res) => {
  const token: string = req.cookies['token'];

  await revokeSessionToken({ tokenValue: token });

  res.header('Set-Cookie', unsetCookie('token'));
  res.status(HttpStatus.noContent).end();
});

router.get('/member', (req, res) => {
  res.json(serializeMember(getAuthenticatedMember()));
});
