import { injectableClass } from 'ditox';

import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { HtmlParserPort } from '../../infrastructure/html-parser/html-parser.port';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';
import { RequestEdited } from '../request-events';

export class EditRequest {
  static inject = injectableClass(this, TOKENS.eventPublisher, TOKENS.htmlParser, TOKENS.requestRepository);

  constructor(
    private readonly eventPublisher: EventPublisherPort,
    private readonly htmlParser: HtmlParserPort,
    private readonly requestRepository: RequestRepository
  ) {}

  async handle(requestId: string, title: string, body: string): Promise<void> {
    await this.requestRepository.update(requestId, {
      title,
      body: {
        html: body,
        text: this.htmlParser.getTextContent(body),
      },
    });

    this.eventPublisher.publish(new RequestEdited(requestId));
  }
}
