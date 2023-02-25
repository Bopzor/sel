import { CommandHandler } from '../../../../common/cqs/command-handler';
import { EventPublisher } from '../../../../common/cqs/event-publisher';
import { DomainEvent } from '../../../../common/ddd/domain-event';
import { Request } from '../../entities/request.entity';
import { RequestRepository } from '../../request.repository';

export type CreateRequestCommand = {
  id: string;
  title: string;
  description: string;
};

export class CreateRequestHandler implements CommandHandler<CreateRequestCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly requestRepository: RequestRepository
  ) {}

  async handle(command: CreateRequestCommand): Promise<void> {
    const request = new Request(command);

    await this.requestRepository.save(request);
    this.publisher.publish(new RequestCreatedEvent());
  }
}

export class RequestCreatedEvent extends DomainEvent {}
