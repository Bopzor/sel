import { requestAuthenticationCodeQuerySchema, verifyAuthenticationCodeQuerySchema } from '@sel/shared';
import { defined } from '@sel/utils';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { setCookie } from 'src/infrastructure/cookie';
import { HttpStatus } from 'src/infrastructure/http';
import { TOKENS } from 'src/tokens';

import { requestAuthenticationCode } from './domain/request-authentication-code.command';
import { verifyAuthenticationCode } from './domain/verify-authentication-code.command';
import { findTokenById } from './token.persistence';

export const router = express.Router();

router.post('/request-authentication-code', async (req, res) => {
  const { email } = requestAuthenticationCodeQuerySchema.parse(req.query);

  await requestAuthenticationCode({
    email,
  });

  res.status(HttpStatus.noContent).end();
});

router.get('/verify-authentication-code', async (req, res) => {
  const generator = container.resolve(TOKENS.generator);

  const { code } = verifyAuthenticationCodeQuerySchema.parse(req.query);
  const sessionTokenId = generator.id();

  await verifyAuthenticationCode({
    code,
    sessionTokenId,
  });

  const sessionToken = defined(await findTokenById(sessionTokenId));

  res.header('set-cookie', setCookie('token', sessionToken.value, sessionToken.expirationDate));
  res.status(HttpStatus.noContent).end();
});
