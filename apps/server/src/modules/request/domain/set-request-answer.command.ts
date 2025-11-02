import { RequestStatus } from '@sel/shared';
import { and, eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { BadRequest, NotFound } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import {
  RequestNegativeAnswerGivenEvent,
  RequestPositiveAnswerGivenEvent,
  RequestAnswerWithdrawnEvent,
} from '../request.entities';
import { findRequestById } from '../request.persistence';

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
    throw new NotFound('Request not found');
  }

  if (request.status !== RequestStatus.pending) {
    throw new BadRequest('Request is not pending');
  }

  if (memberId === request.requesterId) {
    throw new BadRequest('Member is requester');
  }

  const requestAnswer = await db.query.requestAnswers.findFirst({
    where: and(eq(schema.requestAnswers.requestId, requestId), eq(schema.requestAnswers.memberId, memberId)),
  });

  if (answer !== null) {
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

    const DomainEvent =
      answer === 'positive' ? RequestPositiveAnswerGivenEvent : RequestNegativeAnswerGivenEvent;

    events.publish(
      new DomainEvent(request.id, {
        respondentId: memberId,
        previousAnswer: requestAnswer ? requestAnswer.answer : null,
      }),
    );
  }

  if (requestAnswer && answer === null) {
    await db.delete(schema.requestAnswers).where(eq(schema.requestAnswers.id, requestAnswer.id));

    events.publish(
      new RequestAnswerWithdrawnEvent(request.id, {
        respondentId: memberId,
        previousAnswer: requestAnswer.answer,
      }),
    );
  }
}
