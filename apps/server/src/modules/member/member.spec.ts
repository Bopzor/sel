import * as shared from '@sel/shared';
import { createFactory } from '@sel/utils';
import express from 'express';
import supertest from 'supertest';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
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
    const authenticatedMemberId = await persist.member({});

    await persist.token({ memberId: authenticatedMemberId, value: 'token', type: TokenType.session });

    const app = express();
    app.use('/', router);

    const agent = supertest.agent(app);

    const onboardingMemberId = await persist.member({ status: shared.MemberStatus.onboarding });
    await agent.get(`/${onboardingMemberId}`).set('Cookie', 'token=token').expect(404);

    const inactiveMemberId = await persist.member({ status: shared.MemberStatus.inactive });
    await agent.get(`/${inactiveMemberId}`).set('Cookie', 'token=token').expect(404);
  });
});
