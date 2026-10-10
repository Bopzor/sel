import { addDuration, createDate, createId, defined } from '@sel/utils';
import supertest from 'supertest';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from './factories';
import { container } from './infrastructure/container';
import { StubEmailSender } from './infrastructure/email';
import { HttpStatus } from './infrastructure/http';
import { initialize } from './initialize';
import { TokenType } from './modules/authentication/authentication.entities';
import { updateLetsConfig } from './modules/lets-config/lets-config.persistence';
import { createMember } from './modules/member/domain/create-member.command';
import { resetDatabase, schema } from './persistence';
import { clearDatabase, db } from './persistence/database';
import { server } from './server';
import { TOKENS } from './tokens';

describe('end-to-end', () => {
  beforeAll(resetDatabase);
  beforeEach(initialize);
  afterEach(clearDatabase);

  let emailSender: StubEmailSender;

  beforeEach(() => {
    emailSender = new StubEmailSender();
    container.bindValue(TOKENS.emailSender, emailSender);
  });

  async function findAuthenticationCode() {
    await container.resolve(TOKENS.events).waitForListeners();

    const email = defined(emailSender.emails[0]);
    const code = defined(email.text.match(/: ([0-9]{6})\n/)?.[1]);

    return code;
  }

  it('authenticates and retrieves protected resources', async () => {
    const app = server();
    const request = supertest.agent(app);

    await createMember({
      memberId: 'memberId',
      email: 'email@domain.tld',
    });

    await request.get('/members').expect(HttpStatus.unauthorized);

    await request
      .post('/authentication/request-authentication-code')
      .query({ email: 'email@domain.tld' })
      .expect(HttpStatus.noContent);

    await request
      .get('/authentication/verify-authentication-code')
      .query({ code: await findAuthenticationCode() })
      .expect(HttpStatus.noContent);

    await request.get('/members').expect(HttpStatus.ok);

    await request.delete('/session').expect(HttpStatus.noContent);

    await request.get('/members').expect(HttpStatus.unauthorized);
  });

  it('rejects a revoked or an expired session token', async () => {
    const app = server();
    const request = supertest.agent(app);

    await createMember({ memberId: 'memberId', email: 'email@domain.tld' });

    await persist.token({
      memberId: 'memberId',
      type: TokenType.session,
      value: 'revoked',
      expirationDate: addDuration(createDate(), { days: 1 }),
      revoked: true,
    });

    await persist.token({
      memberId: 'memberId',
      type: TokenType.session,
      value: 'expired',
      expirationDate: addDuration(createDate(), { days: -1 }),
    });

    await request.get('/members').set('Cookie', 'token=revoked').expect(HttpStatus.unauthorized);
    await request.get('/members').set('Cookie', 'token=expired').expect(HttpStatus.unauthorized);
  });

  it('creates a transaction as a payer', async () => {
    const app = server();
    const request = supertest.agent(app);

    await db.insert(schema.config).values({ id: createId(), currency: '', currencyPlural: '' });

    await createMember({ memberId: 'payerId', email: 'payer@domain.tld' });
    await createMember({ memberId: 'recipientId', email: 'recipient@domain.tld' });

    await persist.token({
      memberId: 'payerId',
      type: TokenType.session,
      value: 'token',
      expirationDate: addDuration(createDate(), { days: 1 }),
    });

    await request
      .post('/transactions')
      .set('Cookie', 'token=token')
      .send({
        payerId: 'payerId',
        recipientId: 'recipientId',
        amount: 1,
        description: 'description',
      })
      .expect(201);

    await container.resolve(TOKENS.events).waitForListeners();
  });

  it('serves the web app manifest from the config', async () => {
    await updateLetsConfig({ letsName: 'SEL', place: 'Cavaillon', primaryColor: '#005f7e' });

    const response = await supertest(server())
      .get('/manifest.webmanifest')
      .expect(HttpStatus.ok)
      .expect('Content-Type', /application\/manifest\+json/);

    expect(response.body).toMatchObject({
      name: 'SEL',
      short_name: 'SEL',
      description: "L'application du Système d'Échange Local de Cavaillon.",
      theme_color: '#005f7e',
    });
  });
});
