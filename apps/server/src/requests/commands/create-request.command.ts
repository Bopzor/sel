import { injectableClass } from 'ditox';

import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { HtmlParserPort } from '../../infrastructure/html-parser/html-parser.port';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';
import { RequestCreated } from '../request-events';

export class CreateRequest {
  static inject = injectableClass(
    this,
    TOKENS.date,
    TOKENS.eventPublisher,
    TOKENS.htmlParser,
    TOKENS.requestRepository
  );

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly htmlParser: HtmlParserPort,
    private readonly requestRepository: RequestRepository
  ) {}

  async handle(requestId: string, requesterId: string, title: string, body: string): Promise<void> {
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

    this.eventPublisher.publish(new RequestCreated(requestId));
  }
}
