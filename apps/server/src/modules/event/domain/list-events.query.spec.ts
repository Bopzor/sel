import { addDuration, createDate } from '@sel/utils';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { resetDatabase } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { listEvents } from './list-events.query';
import { setEventParticipation } from './set-event-participation.command';

describe('listEvents', () => {
  beforeAll(resetDatabase);
  afterEach(clearDatabase);

  const tomorrow = addDuration(createDate(), { days: 1 });
  const nextWeek = addDuration(createDate(), { days: 7 });
  const yesterday = addDuration(createDate(), { days: -1 });

  beforeEach(async () => {
    container.bindValue(TOKENS.events, new StubEvents());

    await persist.member({ id: 'meId' });
    await persist.member({ id: 'organizerId' });
  });

  async function listEventIds(query: Partial<Parameters<typeof listEvents>[0]> = {}) {
    const { events } = await listEvents({ page: 1, pageSize: 10, ...query });

    return events.map(({ id }) => id);
  }

  it('lists all the events, the undated ones first and then the latest', async () => {
    await persist.event({ id: 'yesterdayId', date: yesterday });
    await persist.event({ id: 'tomorrowId', date: tomorrow });
    await persist.event({ id: 'undatedId', date: null });

    expect(await listEventIds()).toEqual(['undatedId', 'tomorrowId', 'yesterdayId']);
  });

  it('lists the past events, the latest first', async () => {
    await persist.event({ id: 'lastWeekId', date: addDuration(createDate(), { days: -7 }) });
    await persist.event({ id: 'yesterdayId', date: yesterday });
    await persist.event({ id: 'undatedId', date: null });
    await persist.event({ id: 'tomorrowId', date: tomorrow });

    expect(await listEventIds({ timing: 'past' })).toEqual(['yesterdayId', 'lastWeekId']);
  });

  it('searches the events by title and message', async () => {
    await persist.event({ id: 'titleId', title: 'Picnic at the lake' });
    await persist.event({
      id: 'messageId',
      messageId: await persist.message({ text: 'Bring a PICNIC basket' }),
    });
    await persist.event({ id: 'otherId', title: 'Village fair' });

    expect((await listEventIds({ search: 'picnic' })).toSorted()).toEqual(['messageId', 'titleId']);
  });

  it('lists the events of an organizer', async () => {
    await persist.event({ id: 'mineId', organizerId: 'meId' });
    await persist.event({ id: 'otherId', organizerId: 'organizerId' });

    expect(await listEventIds({ organizerId: 'meId' })).toEqual(['mineId']);
  });

  it('lists the events of a year', async () => {
    await persist.event({ id: '2025Id', date: createDate('2025-06-01') });
    await persist.event({ id: '2026Id', date: createDate('2026-06-01') });

    expect(await listEventIds({ year: 2025 })).toEqual(['2025Id']);
  });

  it('paginates the events', async () => {
    await persist.event({ id: 'firstId', date: createDate('2026-03-01') });
    await persist.event({ id: 'secondId', date: createDate('2026-02-01') });
    await persist.event({ id: 'thirdId', date: createDate('2026-01-01') });

    const { total, events } = await listEvents({ page: 2, pageSize: 2 });

    expect(total).toBe(3);
    expect(events.map(({ id }) => id)).toEqual(['thirdId']);
  });

  it('lists the events where a member goes', async () => {
    await persist.event({ id: 'goingId' });
    await persist.event({ id: 'notGoingId' });
    await persist.event({ id: 'otherId' });

    await setEventParticipation({ eventId: 'goingId', memberId: 'meId', participation: 'yes' });
    await setEventParticipation({ eventId: 'notGoingId', memberId: 'meId', participation: 'no' });

    expect(await listEventIds({ participantId: 'meId' })).toEqual(['goingId']);
  });

  it('lists the upcoming events, and the undated ones after them', async () => {
    await persist.event({ id: 'undatedId', date: null });
    await persist.event({ id: 'pastId', date: yesterday });
    await persist.event({ id: 'nextWeekId', date: nextWeek });
    await persist.event({ id: 'tomorrowId', date: tomorrow });

    expect(await listEventIds({ timing: 'upcoming' })).toEqual(['tomorrowId', 'nextWeekId']);

    expect(await listEventIds({ timing: 'upcoming', includeUndated: true })).toEqual([
      'tomorrowId',
      'nextWeekId',
      'undatedId',
    ]);
  });
});
