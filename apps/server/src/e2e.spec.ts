import { defined } from '@sel/utils';
import supertest from 'supertest';
import { beforeAll, beforeEach, describe, it } from 'vitest';

import { container } from './infrastructure/container';
import { StubEmailSender } from './infrastructure/email';
import { HttpStatus } from './infrastructure/http';
import { initialize } from './initialize';
import { createMember } from './modules/member/domain/create-member.command';
import { resetDatabase } from './persistence';
import { clearDatabase } from './persistence/database';
import { server } from './server';
import { TOKENS } from './tokens';

describe('end-to-end', () => {
  beforeAll(resetDatabase);
  beforeEach(clearDatabase);
  beforeEach(initialize);

  let emailSender: StubEmailSender;

  beforeEach(() => {
    emailSender = new StubEmailSender();
    container.bindValue(TOKENS.emailSender, emailSender);
  });

  async function findAuthenticationToken() {
    await container.resolve(TOKENS.events).waitForListeners();

    const email = defined(emailSender.emails[0]);
    const link = defined(email.text.match(/(http:\/\/.*)\n/)?.[1]);

    return new URL(link).searchParams.get('auth-token') as string;
  }

  it('authenticates and retrieves protected resources', async () => {
    const app = server();

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const request = supertest.agent(app);

    await createMember({
      memberId: 'memberId',
      email: 'email@domain.tld',
    });

    await request.get('/members').expect(HttpStatus.unauthorized);

    await request
      .post('/authentication/request-authentication-link')
      .query({ email: 'email@domain.tld' })
      .expect(HttpStatus.noContent);

    await request
      .get('/authentication/verify-authentication-token')
      .query({ token: await findAuthenticationToken() })
      .expect(HttpStatus.noContent);

    await request.get('/members').expect(HttpStatus.ok);

    await request.delete('/session').expect(HttpStatus.noContent);

    await request.get('/members').expect(HttpStatus.unauthorized);
  });
});
