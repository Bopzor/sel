import { RequestStatus } from '@sel/shared';
import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import {
  CannotAnswerOwnRequestError,
  RequestAnswerChangedEvent,
  RequestAnswerCreatedEvent,
  RequestAnswerDeletedEvent,
  RequestEditedEvent,
  RequestIsNotPendingError,
  RequestNotFoundError,
} from './request.entities';
import { findRequestById } from './request.persistence';

export type SetRequestAnswerCommand = {
  requestId: string;
  memberId: string;
  answer: 'positive' | 'negative' | null;
};

export async function setRequestAnswer(command: SetRequestAnswerCommand): Promise<void> {
  const generator = container.resolve(TOKENS.generator);
  const now = container.resolve(TOKENS.date).now();
  const events = container.resolve(TOKENS.events);

  const { requestId, memberId, answer } = command;

  const request = await findRequestById(requestId);

  if (!request) {
    throw new RequestNotFoundError();
  }

  if (request.status !== RequestStatus.pending) {
    throw new RequestIsNotPendingError();
  }

  if (memberId === request.requesterId) {
    throw new CannotAnswerOwnRequestError();
  }

  const requestAnswer = await db.query.requestAnswers.findFirst({
    where: eq(schema.requestAnswers.requestId, requestId),
  });

  if (answer !== null) {
    if (answer === requestAnswer?.answer) {
      return;
    }

    const requestAnswerId = requestAnswer?.id ?? generator.id();

    await db
      .insert(schema.requestAnswers)
      .values({
        id: requestAnswerId,
        requestId: request.id,
        memberId,
        date: now,
        answer,
      })
      .onConflictDoUpdate({
        target: schema.requestAnswers.id,
        set: { answer, updatedAt: now },
      });

    if (requestAnswer) {
      events.publish(new RequestAnswerChangedEvent(request.id, requestAnswerId, answer));
    } else {
      events.publish(new RequestAnswerCreatedEvent(request.id, requestAnswerId, memberId, answer));
    }
  }

  if (requestAnswer && answer === null) {
    await db.delete(schema.requestAnswers).where(eq(schema.requestAnswers, requestAnswer.id));
    events.publish(new RequestAnswerDeletedEvent(request.id, requestAnswer.id));
  }

  events.publish(new RequestEditedEvent(command.requestId));
}
