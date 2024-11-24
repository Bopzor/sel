import * as shared from '@sel/shared';
import { createFactory } from '@sel/utils';
import express from 'express';
import supertest from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { insert } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { db, resetDatabase, schema } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { TokenType } from '../authentication/authentication.entities';
import { insertToken } from '../authentication/token.persistence';

import { createMember } from './domain/create-member.command';
import { updateMemberProfile } from './domain/update-member-profile.command';
import { Member, MemberCreatedEvent, MemberInsert, OnboardingCompletedEvent } from './member.entities';
import { findMemberById } from './member.persistence';
import { router } from './member.router';

describe('member', () => {
  beforeAll(resetDatabase);
  beforeEach(clearDatabase);

  let events: StubEvents;

  beforeEach(() => {
    events = new StubEvents();
    container.bindValue(TOKENS.events, events);
  });

  async function saveMember(values: Partial<MemberInsert>) {
    const [{ id }] = await db
      .insert(schema.members)
      .values(insert.member(values))
      .returning({ id: schema.members.id })
      .execute();

    return id;
  }

  const createUpdateProfileData = createFactory<shared.UpdateMemberProfileData>(() => ({
    firstName: '',
    lastName: '',
    emailVisible: true,
    phoneNumbers: [],
    onboardingCompleted: true,
  }));

  it('creates a new member with default values', async () => {
    await createMember({
      memberId: 'memberId',
      email: 'me@domain.tld',
    });

    expect(await findMemberById('memberId')).toEqual<Member>({
      id: 'memberId',
      status: shared.MemberStatus.onboarding,
      firstName: '',
      lastName: '',
      email: 'me@domain.tld',
      emailVisible: false,
      phoneNumbers: [],
      bio: null,
      address: null,
      avatarId: null,
      membershipStartDate: expect.any(Date),
      notificationDelivery: [],
      balance: 0,
      roles: [],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('creates a member with the given values', async () => {
    await createMember({
      memberId: 'memberId',
      email: 'me@domain.tld',
      firstName: 'First',
      lastName: 'Last',
    });

    expect(await findMemberById('memberId')).toMatchObject<Partial<Member>>({
      firstName: 'First',
      lastName: 'Last',
    });
  });

  it('triggers a domain event when a member is created', async () => {
    await createMember({ memberId: 'memberId', email: '' });

    expect(events.events).toContainEqual(new MemberCreatedEvent('memberId'));
  });

  it("updates a member's profile", async () => {
    await saveMember({ id: 'memberId' });

    const data: shared.UpdateMemberProfileData = {
      firstName: 'First',
      lastName: 'Last',
      emailVisible: true,
      phoneNumbers: [{ number: '123', visible: true }],
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

  it("set the member's status to active when onboarding is completed", async () => {
    await saveMember({ id: 'memberId', status: shared.MemberStatus.onboarding });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: true }),
    });

    expect(await findMemberById('memberId')).toHaveProperty('status', shared.MemberStatus.active);
  });

  it("set the member's status to onboarding when onboardingCompleted is set to false", async () => {
    await saveMember({ id: 'memberId', status: shared.MemberStatus.active });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: false }),
    });

    expect(await findMemberById('memberId')).toHaveProperty('status', shared.MemberStatus.onboarding);
  });

  it('triggers a domain event when the onboarding was completed', async () => {
    await saveMember({ id: 'memberId', status: shared.MemberStatus.onboarding });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: true }),
    });

    expect(events.events).toContainEqual(new OnboardingCompletedEvent('memberId'));
  });

  it('fails to retrieve a member that is not active', async () => {
    const authenticatedMemberId = await saveMember({});

    await insertToken(
      insert.token({ memberId: authenticatedMemberId, value: 'token', type: TokenType.session }),
    );

    const app = express();
    app.use('/', router);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const agent = supertest.agent(app);

    const onboardingMemberId = await saveMember({ status: shared.MemberStatus.onboarding });
    await agent.get(`/${onboardingMemberId}`).set('Cookie', 'token=token').expect(404);

    const inactiveMemberId = await saveMember({ status: shared.MemberStatus.inactive });
    await agent.get(`/${inactiveMemberId}`).set('Cookie', 'token=token').expect(404);
  });
});
