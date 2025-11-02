import { beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { db } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import {
  RequestAnswerWithdrawnEvent,
  RequestNegativeAnswerGivenEvent,
  RequestPositiveAnswerGivenEvent,
} from '../request.entities';

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
      new RequestPositiveAnswerGivenEvent('requestId', {
        respondentId: 'memberId',
        previousAnswer: null,
      }),
    );
  });

  it('sets a second answer on a request', async () => {
    await persist.member({ id: 'otherMemberId' });

    await setRequestAnswer(command);

    command.memberId = 'otherMemberId';
    command.answer = 'negative';
    await setRequestAnswer(command);

    const requestAnswers = await db.query.requestAnswers.findMany();

    expect(requestAnswers).toHaveLength(2);
    expect(events.events).toContainEqual(
      new RequestNegativeAnswerGivenEvent('requestId', {
        respondentId: 'otherMemberId',
        previousAnswer: null,
      }),
    );
  });

  it('changes a positive answer on a request to a negative one', async () => {
    await setRequestAnswer(command);

    command.answer = 'negative';
    await setRequestAnswer(command);

    const requestAnswer = await db.query.requestAnswers.findFirst();

    expect(requestAnswer).toHaveProperty('answer', 'negative');

    expect(events.events).toContainEqual(
      new RequestNegativeAnswerGivenEvent('requestId', {
        respondentId: 'memberId',
        previousAnswer: 'positive',
      }),
    );
  });

  it('changes a negative answer on a request to a positive one', async () => {
    command.answer = 'negative';
    await setRequestAnswer(command);

    command.answer = 'positive';
    await setRequestAnswer(command);

    const requestAnswer = await db.query.requestAnswers.findFirst();

    expect(requestAnswer).toHaveProperty('answer', 'positive');

    expect(events.events).toContainEqual(
      new RequestPositiveAnswerGivenEvent('requestId', {
        respondentId: 'memberId',
        previousAnswer: 'negative',
      }),
    );
  });

  it('deletes a positive answer to a request', async () => {
    await setRequestAnswer(command);

    command.answer = null;
    await setRequestAnswer(command);

    await expect(db.query.requestAnswers.findFirst()).resolves.toBeUndefined();

    expect(events.events).toContainEqual(
      new RequestAnswerWithdrawnEvent('requestId', {
        respondentId: 'memberId',
        previousAnswer: 'positive',
      }),
    );
  });

  it('deletes a negative answer to a request', async () => {
    command.answer = 'negative';
    await setRequestAnswer(command);

    command.answer = null;
    await setRequestAnswer(command);

    await expect(db.query.requestAnswers.findFirst()).resolves.toBeUndefined();

    expect(events.events).toContainEqual(
      new RequestAnswerWithdrawnEvent('requestId', {
        respondentId: 'memberId',
        previousAnswer: 'negative',
      }),
    );
  });
});
