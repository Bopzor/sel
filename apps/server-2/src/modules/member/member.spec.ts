import { UpdateMemberProfileData } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { insert } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { db, resetDatabase, schema } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { createMember } from './create-member.command';
import {
  Member,
  MemberCreatedEvent,
  MemberInsert,
  MemberStatus,
  OnboardingCompletedEvent,
} from './member.entities';
import { findMemberById } from './member.persistence';
import { updateMemberProfile } from './update-member-profile.command';

describe('member', () => {
  beforeAll(resetDatabase);
  beforeEach(clearDatabase);

  let events: StubEvents;

  beforeEach(() => {
    events = new StubEvents();
    container.bindValue(TOKENS.events, events);
  });

  async function saveMember(values: Partial<MemberInsert>) {
    return db.insert(schema.members).values(insert.member(values)).execute();
  }

  const createUpdateProfileData = createFactory<UpdateMemberProfileData>(() => ({
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
      status: MemberStatus.onboarding,
      firstName: '',
      lastName: '',
      email: 'me@domain.tld',
      emailVisible: false,
      phoneNumbers: [],
      bio: null,
      address: null,
      membershipStartDate: expect.any(Date),
      notificationDelivery: [],
      balance: 0,
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

    const data: UpdateMemberProfileData = {
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
    await saveMember({ id: 'memberId', status: MemberStatus.onboarding });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: true }),
    });

    expect(await findMemberById('memberId')).toHaveProperty('status', MemberStatus.active);
  });

  it("set the member's status to onboarding when onboardingCompleted is set to false", async () => {
    await saveMember({ id: 'memberId', status: MemberStatus.active });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: false }),
    });

    expect(await findMemberById('memberId')).toHaveProperty('status', MemberStatus.onboarding);
  });

  it('triggers a domain event when the onboarding was completed', async () => {
    await saveMember({ id: 'memberId', status: MemberStatus.onboarding });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: true }),
    });

    expect(events.events).toContainEqual(new OnboardingCompletedEvent('memberId'));
  });
});
