import { RequestStatus } from '@sel/shared';
import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { GeneratorPort } from '../../infrastructure/generator/generator.port';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { RequestAnswerRepository } from '../../persistence/repositories/request-answer/request-answer.repository';
import { TOKENS } from '../../tokens';
import { CannotAnswerOwnRequest, RequestIsNotPending, RequestNotFound } from '../request-errors';
import { RequestAnswerChanged, RequestAnswerCreated, RequestAnswerDeleted } from '../request-events';

export type SetRequestAnswerCommand = {
  requestId: string;
  memberId: string;
  answer: 'positive' | 'negative' | null;
};

export class SetRequestAnswer implements CommandHandler<SetRequestAnswerCommand> {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.eventPublisher,
    TOKENS.requestRepository,
    TOKENS.requestAnswerRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly requestRepository: RequestRepository,
    private readonly requestAnswerRepository: RequestAnswerRepository
  ) {}

  async handle({ requestId, memberId, answer }: SetRequestAnswerCommand): Promise<void> {
    const request = await this.requestRepository.getRequest(requestId);

    if (!request) {
      throw new RequestNotFound(requestId);
    }

    if (request.status !== RequestStatus.pending) {
      throw new RequestIsNotPending(requestId, request.status);
    }

    if (memberId === request.requesterId) {
      throw new CannotAnswerOwnRequest(request.id);
    }

    const requestAnswer = await this.requestAnswerRepository.findRequestAnswer(requestId, memberId);

    if (answer !== null) {
      if (answer === requestAnswer?.answer) {
        return;
      }

      const requestAnswerId = requestAnswer?.id ?? this.generator.id();

      await this.requestAnswerRepository.upsert({
        id: requestAnswerId,
        requestId: request.id,
        memberId,
        date: this.dateAdapter.now(),
        answer,
      });

      if (requestAnswer) {
        this.eventPublisher.publish(new RequestAnswerChanged(request.id, requestAnswerId, answer));
      } else {
        this.eventPublisher.publish(new RequestAnswerCreated(request.id, requestAnswerId, answer));
      }
    }

    if (requestAnswer && answer === null) {
      await this.requestAnswerRepository.delete(requestAnswer.id);
      this.eventPublisher.publish(new RequestAnswerDeleted(request.id, requestAnswer.id));
    }
  }
}
