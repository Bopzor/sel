import { requestAuthenticationLinkQuerySchema, verifyAuthenticationTokenQuerySchema } from '@sel/shared';
import { defined } from '@sel/utils';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { setCookie } from 'src/infrastructure/cookie';
import { HttpStatus } from 'src/infrastructure/http';
import { TOKENS } from 'src/tokens';

import { requestAuthenticationLink } from './domain/request-authentication-link.command';
import { verifyAuthenticationToken } from './domain/verify-authentication-token.command';
import { findTokenById } from './token.persistence';

export const router = express.Router();

router.post('/request-authentication-link', async (req, res) => {
  const { email } = requestAuthenticationLinkQuerySchema.parse(req.query);

  await requestAuthenticationLink({
    email,
  });

  res.status(HttpStatus.noContent).end();
});

router.get('/verify-authentication-token', async (req, res) => {
  const generator = container.resolve(TOKENS.generator);

  const { token } = verifyAuthenticationTokenQuerySchema.parse(req.query);
  const sessionTokenId = generator.id();

  await verifyAuthenticationToken({
    tokenValue: token,
    sessionTokenId,
  });

  const sessionToken = defined(await findTokenById(sessionTokenId));

  res.header('set-cookie', setCookie('token', sessionToken.value, sessionToken.expirationDate));
  res.status(HttpStatus.noContent).end();
});
