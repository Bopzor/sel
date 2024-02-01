import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';
import { RequestIsNotPending, RequestNotFound } from '../request-errors';
import { RequestCanceled, RequestFulfilled } from '../request-events';
import { RequestStatus } from '../request.entity';

export type ChangeRequestStatusCommand = {
  requestId: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  status: RequestStatus.fulfilled | RequestStatus.canceled;
};

export class ChangeRequestStatus implements CommandHandler<ChangeRequestStatusCommand> {
  static inject = injectableClass(this, TOKENS.eventPublisher, TOKENS.requestRepository);

  constructor(
    private readonly eventPublisher: EventPublisherPort,
    private readonly requestRepository: RequestRepository
  ) {}

  async handle(command: ChangeRequestStatusCommand): Promise<void> {
    const request = await this.requestRepository.getRequest(command.requestId);

    if (!request) {
      throw new RequestNotFound(command.requestId);
    }

    if ([RequestStatus.fulfilled, RequestStatus.canceled].includes(request.status)) {
      throw new RequestIsNotPending(request.id, request.status);
    }

    await this.requestRepository.update(request.id, {
      status: command.status,
    });

    if (command.status === RequestStatus.fulfilled) {
      this.eventPublisher.publish(new RequestFulfilled(request.id));
    }

    if (command.status === RequestStatus.canceled) {
      this.eventPublisher.publish(new RequestCanceled(request.id));
    }
  }
}
