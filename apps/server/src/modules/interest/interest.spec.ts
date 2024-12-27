import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { insert } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { resetDatabase } from 'src/persistence';
import { clearDatabase, db } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { insertFile } from '../file/file.persistence';
import { insertMember } from '../member';

import { addInterestMember } from './domain/add-interest-member.command';
import { createInterest } from './domain/create-interest.command';
import { editInterestMember } from './domain/edit-interest-member.command';
import { removeInterestMember } from './domain/remove-interest-member.command';
import {
  Interest,
  InterestCreatedEvent,
  InterestMemberAddedEvent,
  InterestMemberEditedEvent,
  InterestMemberRemovedEvent,
  MemberInterest,
} from './interest.entities';
import { findInterestById, insertInterest } from './interest.persistence';

describe('interest', () => {
  beforeAll(resetDatabase);
  beforeEach(clearDatabase);

  let events: StubEvents;

  beforeEach(async () => {
    events = new StubEvents();
    container.bindValue(TOKENS.events, events);

    await insertMember(insert.member({ id: 'memberId' }));
    await insertFile(insert.file({ id: 'imageId', uploadedBy: 'memberId' }));
  });

  it('creates a new interest', async () => {
    await createInterest({
      interestId: 'interestId',
      label: 'label',
      description: 'description',
      imageId: 'imageId',
    });

    expect(await findInterestById('interestId')).toEqual<Interest>({
      id: 'interestId',
      label: 'label',
      description: 'description',
      imageId: 'imageId',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    expect(events.events).toContainEqual(new InterestCreatedEvent('interestId'));
  });

  it('adds a member to an interest', async () => {
    await insertInterest(insert.interest({ id: 'interestId', imageId: 'imageId' }));

    await addInterestMember({ memberId: 'memberId', interestId: 'interestId' });

    expect(await db.query.membersInterests.findFirst()).toMatchObject<Partial<MemberInterest>>({
      memberId: 'memberId',
      interestId: 'interestId',
    });

    expect(events.events).toContainEqual(
      new InterestMemberAddedEvent('interestId', { memberId: 'memberId' }),
    );
  });

  it('removes a member from an interest', async () => {
    await insertInterest(insert.interest({ id: 'interestId', imageId: 'imageId' }));

    await addInterestMember({ memberId: 'memberId', interestId: 'interestId' });
    await removeInterestMember({ memberId: 'memberId', interestId: 'interestId' });

    expect(await db.query.membersInterests.findFirst()).toBeUndefined();

    expect(events.events).toContainEqual(
      new InterestMemberRemovedEvent('interestId', { memberId: 'memberId' }),
    );
  });

  it("edits a member interest's description", async () => {
    await insertInterest(insert.interest({ id: 'interestId', imageId: 'imageId' }));

    await addInterestMember({ memberId: 'memberId', interestId: 'interestId' });
    await editInterestMember({ memberId: 'memberId', interestId: 'interestId', description: 'description' });

    expect(await db.query.membersInterests.findFirst()).toHaveProperty('description', 'description');

    expect(events.events).toContainEqual(
      new InterestMemberEditedEvent('interestId', { memberId: 'memberId' }),
    );
  });
});
