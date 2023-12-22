import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { HtmlParserPort } from '../infrastructure/html-parser/html-parser.port';
import { TOKENS } from '../tokens';

import { RequestRepository } from './request.repository';

export class RequestService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.htmlParser,
    TOKENS.requestRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
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

    return requestId;
  }
}
