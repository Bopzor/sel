import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { EventsPort } from '../infrastructure/events/events.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { HtmlParserPort } from '../infrastructure/html-parser/html-parser.port';
import { TOKENS } from '../tokens';

import { RequestCreated } from './events';
import { RequestRepository } from './request.repository';

export class RequestService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.events,
    TOKENS.htmlParser,
    TOKENS.requestRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly events: EventsPort,
    private readonly htmlParser: HtmlParserPort,
    private readonly requestRepository: RequestRepository
  ) {}

  async createRequest(requesterId: string, title: string, body: string): Promise<string> {
    const requestId = this.generator.id();

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

    this.events.emit(new RequestCreated('requestId'));

    return requestId;
  }
}
