import { injected } from 'brandi';

import { TOKENS } from '../../../../api/tokens';
import { CommandHandler } from '../../../../common/cqs/command-handler';
import { EventPublisher } from '../../../../common/cqs/event-publisher';
import { DomainError } from '../../../../common/ddd/domain-error';
import { DomainEvent } from '../../../../common/ddd/domain-event';
import { assertEntity } from '../../../../common/entity-not-found.error';
import { DatePort } from '../../../../common/ports/date/date.port';
import { RequestRepository } from '../../api/request.repository';
import { Request } from '../../entities/request.entity';

export type EditRequestCommand = {
  id: string;
  title?: string;
  description?: string;
};

export class EditRequestHandler implements CommandHandler<EditRequestCommand> {
  constructor(
    private readonly dateAdapter: DatePort,
    private readonly publisher: EventPublisher,
    private readonly requestRepository: RequestRepository
  ) {}

  async handle(command: EditRequestCommand): Promise<void> {
    const request = await this.requestRepository.findById(command.id);

    assertEntity(Request, request, { id: command.id });

    let edited = false;

    if (command.title && command.title !== request.title) {
      request.title = command.title;
      edited = true;
    }

    if (command.description && command.description !== request.description) {
      request.description = command.description;
      edited = true;
    }

    if (!edited) {
      throw new NoEditedField();
    }

    request.lastEditionDate = this.dateAdapter.now();

    await this.requestRepository.save(request);
    this.publisher.publish(new RequestEditedEvent());
  }
}

injected(EditRequestHandler, TOKENS.dateAdapter, TOKENS.publisher, TOKENS.requestRepository);

export class NoEditedField extends DomainError {}

export class RequestEditedEvent extends DomainEvent {}
