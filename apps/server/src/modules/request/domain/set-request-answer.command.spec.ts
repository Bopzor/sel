import { beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { db } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { RequestAnswerSetEvent } from '../request.entities';

import { setRequestAnswer, SetRequestAnswerCommand } from './set-request-answer.command';

describe('setRequestAnswer', () => {
  let command: SetRequestAnswerCommand;
  let events: StubEvents;

  beforeEach(async () => {
    await clearDatabase();

    await persist.member({ id: 'memberId' });

    await persist.member({ id: 'requesterId' });
    await persist.request({ id: 'requestId', requesterId: 'requesterId' });
  });

  beforeEach(() => {
    events = new StubEvents();

    container.bindValue(TOKENS.events, events);

    command = {
      requestId: 'requestId',
      memberId: 'memberId',
      answer: 'positive',
    };
  });

  it('sets an answer on a request', async () => {
    await setRequestAnswer(command);

    const requestAnswer = await db.query.requestAnswers.findFirst();

    expect(requestAnswer).toHaveProperty('requestId', 'requestId');
    expect(requestAnswer).toHaveProperty('memberId', 'memberId');
    expect(requestAnswer).toHaveProperty('answer', 'positive');

    expect(events.events).toContainEqual(
      new RequestAnswerSetEvent('requestId', {
        respondentId: 'memberId',
        answer: 'positive',
        previousAnswer: null,
      }),
    );
  });

  it('sets a second answer on a request', async () => {
    await persist.member({ id: 'otherMemberId' });

    await setRequestAnswer(command);

    command.memberId = 'otherMemberId';
    await setRequestAnswer(command);

    const requestAnswers = await db.query.requestAnswers.findMany();

    expect(requestAnswers).toHaveLength(2);
  });

  it('changes an answer on a request', async () => {
    await setRequestAnswer(command);

    command.answer = 'negative';
    await setRequestAnswer(command);

    const requestAnswer = await db.query.requestAnswers.findFirst();

    expect(requestAnswer).toHaveProperty('answer', 'negative');

    expect(events.events).toContainEqual(
      new RequestAnswerSetEvent('requestId', {
        respondentId: 'memberId',
        previousAnswer: 'positive',
        answer: 'negative',
      }),
    );
  });

  it('deletes an answer to a request', async () => {
    await setRequestAnswer(command);

    command.answer = null;
    await setRequestAnswer(command);

    await expect(db.query.requestAnswers.findFirst()).resolves.toBeUndefined();

    expect(events.events).toContainEqual(
      new RequestAnswerSetEvent('requestId', {
        respondentId: 'memberId',
        answer: null,
        previousAnswer: 'positive',
      }),
    );
  });
});
