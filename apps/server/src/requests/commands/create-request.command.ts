import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { HtmlParserPort } from '../../infrastructure/html-parser/html-parser.port';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';
import { RequestCreated } from '../request-events';

export type CreateRequestCommand = {
  requestId: string;
  requesterId: string;
  title: string;
  body: string;
};

export class CreateRequest implements CommandHandler<CreateRequestCommand> {
  static inject = injectableClass(
    this,
    TOKENS.date,
    TOKENS.eventPublisher,
    TOKENS.htmlParser,
    TOKENS.requestRepository,
  );

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly htmlParser: HtmlParserPort,
    private readonly requestRepository: RequestRepository,
  ) {}

  async handle({ requestId, requesterId, title, body }: CreateRequestCommand): Promise<void> {
    await this.requestRepository.insert({
      id: requestId,
      requesterId,
      title,
      date: this.dateAdapter.now(),
      body: {
        html: body,
        text: this.htmlParser.getTextContent(body),
      },
    });

    this.eventPublisher.publish(new RequestCreated(requestId, requesterId));
  }
}
