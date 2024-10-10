import * as shared from '@sel/shared';
import { and, eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { EventParticipationSetEvent } from '../event.entities';

export type SetEventParticipationCommand = {
  eventId: string;
  memberId: string;
  participation: shared.EventParticipation | null;
};

export async function setEventParticipation(command: SetEventParticipationCommand): Promise<void> {
  const { eventId, memberId, participation } = command;

  const generator = container.resolve(TOKENS.generator);
  const now = container.resolve(TOKENS.date).now();
  const events = container.resolve(TOKENS.events);

  const currentParticipation = await db.query.eventParticipations.findFirst({
    where: and(
      eq(schema.eventParticipations.eventId, eventId),
      eq(schema.eventParticipations.participantId, memberId),
    ),
  });

  if (participation !== null) {
    await db
      .insert(schema.eventParticipations)
      .values({
        id: generator.id(),
        eventId: eventId,
        participantId: memberId,
        participation: participation,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [schema.eventParticipations.eventId, schema.eventParticipations.participantId],
        set: {
          participation: participation,
          updatedAt: now,
        },
      });

    events.publish(
      new EventParticipationSetEvent(eventId, {
        participantId: memberId,
        previousParticipation: currentParticipation?.participation ?? null,
        participation,
      }),
    );
  }

  if (participation === null) {
    const participation = await db.query.eventParticipations.findFirst({
      where: and(
        eq(schema.eventParticipations.eventId, eventId),
        eq(schema.eventParticipations.participantId, memberId),
      ),
    });

    if (participation) {
      await db.delete(schema.eventParticipations).where(eq(schema.eventParticipations.id, participation.id));

      events.publish(
        new EventParticipationSetEvent(eventId, {
          participantId: memberId,
          previousParticipation: currentParticipation?.participation ?? null,
          participation: null,
        }),
      );
    }
  }
}
