import * as shared from '@sel/shared';
import { createFactory } from '@sel/utils';
import express from 'express';
import supertest from 'supertest';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { NotFound } from 'src/infrastructure/http';
import { resetDatabase } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { TokenType } from '../authentication/authentication.entities';
import { updateLetsConfig } from '../lets-config/lets-config.persistence';

import { createMember } from './domain/create-member.command';
import { updateMemberProfile } from './domain/update-member-profile.command';
import { Member, MemberCreatedEvent, OnboardingCompletedEvent } from './member.entities';
import { findMemberById, updateMember } from './member.persistence';
import { router } from './member.router';

describe('member', () => {
  beforeAll(resetDatabase);
  afterEach(clearDatabase);

  let events: StubEvents;

  beforeEach(() => {
    events = new StubEvents();
    container.bindValue(TOKENS.events, events);
  });

  const createUpdateProfileData = createFactory<shared.UpdateMemberProfileData>(() => ({
    firstName: '',
    lastName: '',
    emailVisible: true,
    onboardingCompleted: true,
  }));

  it('creates a new member with default values', async () => {
    await createMember({
      memberId: 'memberId',
      email: 'me@domain.tld',
    });

    expect(await findMemberById('memberId')).toEqual<Member>({
      id: 'memberId',
      number: expect.any(Number),
      status: shared.MemberStatus.onboarding,
      firstName: '',
      lastName: '',
      email: 'me@domain.tld',
      emailVisible: false,
      phoneNumber: null,
      phoneNumberVisible: true,
      bio: null,
      address: null,
      avatarId: null,
      membershipStartDate: expect.any(Date),
      notificationDelivery: [],
      balance: 0,
      roles: [shared.MemberRole.member],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('creates a member with the given values', async () => {
    await updateLetsConfig({ initialMemberBalance: 120 });

    await createMember({
      memberId: 'memberId',
      email: 'me@domain.tld',
      firstName: 'First',
      lastName: 'Last',
    });

    expect(await findMemberById('memberId')).toMatchObject<Partial<Member>>({
      firstName: 'First',
      lastName: 'Last',
      balance: 120,
    });
  });

  it('triggers a domain event when a member is created', async () => {
    await createMember({ memberId: 'memberId', email: '' });

    expect(events.events).toContainEqual(new MemberCreatedEvent('memberId'));
  });

  it("updates a member's profile", async () => {
    await persist.member({ id: 'memberId' });

    const data: shared.UpdateMemberProfileData = {
      firstName: 'First',
      lastName: 'Last',
      emailVisible: true,
      phoneNumber: '123',
      phoneNumberVisible: true,
      bio: 'bio',
      address: {
        line1: 'line1',
        city: 'city',
        country: 'country',
        postalCode: 'postalCode',
      },
    };

    await updateMemberProfile({
      memberId: 'memberId',
      data,
    });

    expect(await findMemberById('memberId')).toMatchObject<Partial<Member>>(data);
  });

  it('leaves the fields that are not sent unchanged', async () => {
    await persist.member({ id: 'memberId', firstName: 'First', bio: 'bio', phoneNumber: '0612345678' });

    await updateMemberProfile({ memberId: 'memberId', data: { lastName: 'Last' } });

    expect(await findMemberById('memberId')).toMatchObject<Partial<Member>>({
      firstName: 'First',
      lastName: 'Last',
      bio: 'bio',
      phoneNumber: '0612345678',
    });
  });

  it("removes a member's bio", async () => {
    await persist.member({ id: 'memberId', bio: 'bio' });

    await updateMemberProfile({ memberId: 'memberId', data: { bio: null } });

    expect(await findMemberById('memberId')).toHaveProperty('bio', null);
  });

  it('stores an empty bio as null', async () => {
    await persist.member({ id: 'memberId', bio: 'bio' });

    await updateMemberProfile({ memberId: 'memberId', data: { bio: '' } });

    expect(await findMemberById('memberId')).toHaveProperty('bio', null);
  });

  it("sets a member's avatar", async () => {
    await persist.member({ id: 'memberId' });
    const fileId = await persist.file({ name: 'avatar.png', mimetype: 'image/png', uploadedBy: 'memberId' });

    await updateMemberProfile({ memberId: 'memberId', data: { avatarFileName: 'avatar.png' } });

    expect(await findMemberById('memberId')).toHaveProperty('avatarId', fileId);
  });

  it("removes a member's avatar", async () => {
    await persist.member({ id: 'memberId' });
    const fileId = await persist.file({ name: 'avatar.png', mimetype: 'image/png', uploadedBy: 'memberId' });
    await updateMember('memberId', { avatarId: fileId });

    await updateMemberProfile({ memberId: 'memberId', data: { avatarFileName: null } });

    expect(await findMemberById('memberId')).toHaveProperty('avatarId', null);
  });

  it('rejects an avatar that is not an image', async () => {
    await persist.member({ id: 'memberId' });
    await persist.file({ name: 'doc.pdf', mimetype: 'application/pdf', uploadedBy: 'memberId' });

    await expect(
      updateMemberProfile({ memberId: 'memberId', data: { avatarFileName: 'doc.pdf' } }),
    ).rejects.toThrow('The avatar must be an image');
  });

  it('rejects an avatar uploaded by another member', async () => {
    await persist.member({ id: 'memberId' });
    await persist.member({ id: 'otherMemberId' });
    await persist.file({ name: 'avatar.png', mimetype: 'image/png', uploadedBy: 'otherMemberId' });

    await expect(
      updateMemberProfile({ memberId: 'memberId', data: { avatarFileName: 'avatar.png' } }),
    ).rejects.toThrow('The avatar must be uploaded by the member');
  });

  it("set the member's status to active when onboarding is completed", async () => {
    await persist.member({ id: 'memberId', status: shared.MemberStatus.onboarding });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: true }),
    });

    expect(await findMemberById('memberId')).toHaveProperty('status', shared.MemberStatus.active);
  });

  it("set the member's status to onboarding when onboardingCompleted is set to false", async () => {
    await persist.member({ id: 'memberId', status: shared.MemberStatus.active });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: false }),
    });

    expect(await findMemberById('memberId')).toHaveProperty('status', shared.MemberStatus.onboarding);
  });

  it('triggers a domain event when the onboarding was completed', async () => {
    await persist.member({ id: 'memberId', status: shared.MemberStatus.onboarding });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: true }),
    });

    expect(events.events).toContainEqual(new OnboardingCompletedEvent('memberId'));
  });

  it('fails to retrieve a member that is not active', async () => {
    const onboardingMemberId = await persist.member({ status: shared.MemberStatus.onboarding });
    const systemMemberId = await persist.member({ status: shared.MemberStatus.system });

    const errors: unknown[] = [];

    const app = express();
    app.use(router);
    app.use(((err, req, res, _next) => {
      errors.push(err);
      res.end();
    }) satisfies express.ErrorRequestHandler);

    for (const memberId of [onboardingMemberId, systemMemberId, 'unknownId']) {
      await supertest(app).get(`/${memberId}`);
    }

    expect(errors).toHaveLength(3);

    for (const error of errors) {
      expect(error).toBeInstanceOf(NotFound);
      expect(error).not.toHaveProperty('payload.code');
    }
  });

  it('tells when a member is no longer active', async () => {
    const inactiveMemberId = await persist.member({ status: shared.MemberStatus.inactive });

    let error: unknown;

    const app = express();
    app.use(router);
    app.use(((err, req, res, _next) => {
      error = err;
      res.end();
    }) satisfies express.ErrorRequestHandler);

    await supertest(app).get(`/${inactiveMemberId}`);

    expect(error).toBeInstanceOf(NotFound);
    expect(error).toHaveProperty('payload.code', 'MemberInactive');
  });

  it('tells whether a member is part of the committee', async () => {
    const authenticatedMemberId = await persist.member({ firstName: 'Claire' });
    await persist.member({ firstName: 'Paul', roles: [shared.MemberRole.committee] });

    await persist.token({ memberId: authenticatedMemberId, value: 'token', type: TokenType.session });

    const app = express();
    app.use(router);

    const response = await supertest(app).get('/?sort=firstName').set('Cookie', 'token=token').expect(200);

    expect(response.body).toMatchObject([
      { firstName: 'Claire', committeeMember: false },
      { firstName: 'Paul', committeeMember: true },
    ]);
  });

  describe('transactions', () => {
    const app = express();
    app.use(router);

    let memberId: string, matId: string;

    beforeEach(async () => {
      memberId = await persist.member();
      matId = await persist.member();
    });

    const transaction = (values: Parameters<typeof persist.transaction>[0]) => {
      return persist.transaction({ payerId: memberId, recipientId: matId, creatorId: memberId, ...values });
    };

    it("lists a member's transactions with their comments, request and date", async () => {
      const messageId = await persist.message();
      const requestId = await persist.request({ requesterId: memberId, title: 'Request', messageId });
      const completedAt = new Date(2025, 0, 2);

      await transaction({
        payerComment: 'Thanks',
        recipientComment: 'You are welcome',
        requestId,
        completedAt,
      });
      await transaction({ status: shared.TransactionStatus.pending, createdAt: new Date(2025, 0, 1) });

      const response = await supertest(app).get(`/${memberId}/transactions`).expect(200);

      expect(response.body).toMatchObject([
        { date: new Date(2025, 0, 1).toISOString() },
        {
          payerComment: 'Thanks',
          recipientComment: 'You are welcome',
          request: { id: requestId, title: 'Request' },
          date: completedAt.toISOString(),
        },
      ]);
      expect(response.headers).not.toHaveProperty('x-pagination-total');
    });

    it("paginates a member's transactions", async () => {
      await transaction({});
      await transaction({});

      const response = await supertest(app).get(`/${memberId}/transactions?page=1&pageSize=1`).expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.headers).toHaveProperty('x-pagination-total', '2');
      expect(response.headers).toHaveProperty('x-pagination-page-size', '1');
    });

    it("computes a member's transaction stats", async () => {
      await transaction({ amount: 2 });

      const response = await supertest(app).get(`/${memberId}/transactions/stats`).expect(200);

      expect(response.body).toEqual<shared.MemberTransactionStats>({
        given: 2,
        received: 0,
        count: 1,
        partners: 1,
      });
    });
  });

  describe('activity', () => {
    const app = express();
    app.use(router);

    it("lists a member's activity, with comments", async () => {
      const memberId = await persist.member();
      const messageId = await persist.message({ html: '<p>Nice</p>' });
      const requestId = await persist.request({
        requesterId: memberId,
        messageId,
        createdAt: new Date(2025, 0, 1),
      });

      await persist.comment({ authorId: memberId, requestId, messageId, date: new Date(2025, 0, 2) });

      const response = await supertest(app)
        .get(`/${memberId}/activity?includeComments=true&pageSize=1`)
        .expect(200);

      expect(response.body).toMatchObject([{ type: 'comment', body: '<p>Nice</p>' }]);
      expect(response.headers).toHaveProperty('x-pagination-total', '2');
      expect(response.headers).toHaveProperty('x-pagination-page-size', '1');
    });

    it("counts a member's activity", async () => {
      const memberId = await persist.member();
      const messageId = await persist.message();

      await persist.request({ requesterId: memberId, messageId });

      const response = await supertest(app).get(`/${memberId}/activity/counts`).expect(200);

      expect(response.body).toEqual<shared.MemberActivityCounts>({
        requests: 1,
        requestAnswers: 0,
        events: 0,
        eventParticipations: 0,
        information: 0,
        comments: 0,
      });
    });
  });
});
