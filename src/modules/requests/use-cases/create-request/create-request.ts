import { injected } from 'brandi';

import { TOKENS } from '../../../../api/tokens';
import { CommandHandler } from '../../../../common/cqs/command-handler';
import { EventPublisher } from '../../../../common/cqs/event-publisher';
import { DomainEvent } from '../../../../common/ddd/domain-event';
import { DatePort } from '../../../../common/ports/date/date.port';
import { RequestRepository } from '../../api/request.repository';
import { Request } from '../../entities/request.entity';

export type CreateRequestCommand = {
  id: string;
  requesterId: string;
  title: string;
  description: string;
};

export class CreateRequestHandler implements CommandHandler<CreateRequestCommand> {
  constructor(
    private readonly dateAdapter: DatePort,
    private readonly publisher: EventPublisher,
    private readonly requestRepository: RequestRepository
  ) {}

  async handle(command: CreateRequestCommand): Promise<void> {
    const now = this.dateAdapter.now();

    const request = new Request({
      ...command,
      creationDate: now,
      lastEditionDate: now,
    });

    await this.requestRepository.save(request);
    this.publisher.publish(new RequestCreatedEvent());
  }
}

injected(CreateRequestHandler, TOKENS.dateAdapter, TOKENS.publisher, TOKENS.requestRepository);

export class RequestCreatedEvent extends DomainEvent {}
