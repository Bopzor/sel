import { beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { clearDatabase } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { findEventById } from '../event.persistence';

import { updateEvent } from './update-event.command';

describe('updateEvent', () => {
  const location = { line1: '1 rue de la Paix', postalCode: '75002', city: 'Paris', country: 'France' };

  beforeEach(async () => {
    await clearDatabase();

    container.bindValue(TOKENS.events, new StubEvents());

    await persist.event({
      id: 'eventId',
      organizerId: await persist.member(),
      messageId: await persist.message(),
      date: new Date('2026-10-05T18:00:00.000Z'),
      location,
    });
  });

  it('keeps the date and the location when they are not given', async () => {
    await updateEvent({ eventId: 'eventId', title: 'Title', fileIds: [] });

    const event = await findEventById('eventId');

    expect(event).toHaveProperty('date', new Date('2026-10-05T18:00:00.000Z'));
    expect(event).toHaveProperty('location', location);
  });

  it('removes the date and the location', async () => {
    await updateEvent({ eventId: 'eventId', fileIds: [], date: null, location: null });

    const event = await findEventById('eventId');

    expect(event).toHaveProperty('date', null);
    expect(event).toHaveProperty('location', null);
  });

  it('changes the date', async () => {
    await updateEvent({ eventId: 'eventId', fileIds: [], date: '2026-11-01T10:00:00.000Z' });

    expect(await findEventById('eventId')).toHaveProperty('date', new Date('2026-11-01T10:00:00.000Z'));
  });
});
