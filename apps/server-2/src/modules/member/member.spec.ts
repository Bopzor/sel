import { UpdateMemberProfileData } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { insert } from 'src/factories';
import { events } from 'src/infrastructure/events';
import { db, resetDatabase, schema } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';

import { createMember } from './create-member.command';
import {
  Member,
  MemberCreatedEvent,
  MemberInsert,
  MemberStatus,
  OnboardingCompletedEvent,
} from './member.entities';
import { updateMemberProfile } from './update-member-profile.command';

describe('member', () => {
  beforeAll(resetDatabase);
  beforeEach(clearDatabase);

  async function findMember(memberId: string) {
    return db.query.members.findFirst({
      where: eq(schema.members.id, memberId),
    });
  }

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

    expect(await findMember('memberId')).toEqual<Member>({
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

    expect(await findMember('memberId')).toMatchObject<Partial<Member>>({
      firstName: 'First',
      lastName: 'Last',
    });
  });

  it('triggers a domain event when a member is created', async () => {
    const listener = vi.fn();

    events.addListener(MemberCreatedEvent, listener);

    await createMember({ memberId: 'memberId', email: '' });

    expect(listener).toHaveBeenCalledWith(new MemberCreatedEvent('memberId'));
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

    expect(await findMember('memberId')).toMatchObject<Partial<Member>>(data);
  });

  it("set the member's status to active when onboarding is completed", async () => {
    await saveMember({ id: 'memberId', status: MemberStatus.onboarding });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: true }),
    });

    expect(await findMember('memberId')).toHaveProperty('status', MemberStatus.active);
  });

  it("set the member's status to onboarding when onboardingCompleted is set to false", async () => {
    await saveMember({ id: 'memberId', status: MemberStatus.active });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: false }),
    });

    expect(await findMember('memberId')).toHaveProperty('status', MemberStatus.onboarding);
  });

  it('triggers a domain event when the onboarding was completed', async () => {
    const listener = vi.fn();

    events.addListener(OnboardingCompletedEvent, listener);

    await saveMember({ id: 'memberId', status: MemberStatus.onboarding });

    await updateMemberProfile({
      memberId: 'memberId',
      data: createUpdateProfileData({ onboardingCompleted: true }),
    });

    expect(listener).toHaveBeenCalledWith(new OnboardingCompletedEvent('memberId'));
  });
});
