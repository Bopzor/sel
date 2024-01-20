import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommentsFacade } from '../comments/comments.facade';
import { DatePort } from '../infrastructure/date/date.port';
import { EventsPort } from '../infrastructure/events/events.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { HtmlParserPort } from '../infrastructure/html-parser/html-parser.port';
import { SubscriptionFacade } from '../notifications/subscription.facade';
import { TOKENS } from '../tokens';

import { RequestCommentCreated, RequestCreated, RequestEdited } from './events';
import { Request } from './request.entity';
import { RequestRepository } from './request.repository';

export class RequestService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.events,
    TOKENS.htmlParser,
    TOKENS.commentsFacade,
    TOKENS.subscriptionFacade,
    TOKENS.requestRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly events: EventsPort,
    private readonly htmlParser: HtmlParserPort,
    private readonly commentsFacade: CommentsFacade,
    private readonly subscriptionFacade: SubscriptionFacade,
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

    this.events.emit(new RequestCreated(requestId));

    return requestId;
  }

  async editRequest(request: Request, title: string, body: string): Promise<void> {
    await this.requestRepository.update(request.id, {
      title,
      body: {
        html: body,
        text: this.htmlParser.getTextContent(body),
      },
    });

    this.events.emit(new RequestEdited(request.id));
  }

  async createComment(requestId: string, authorId: string, text: string): Promise<string> {
    const commentId = await this.commentsFacade.createComment('request', requestId, authorId, text);

    this.events.emit(new RequestCommentCreated(requestId, commentId));

    return commentId;
  }

  async createRequestSubscription(event: RequestCreated | RequestCommentCreated): Promise<void> {
    const request = defined(await this.requestRepository.getRequest(event.entityId));

    await this.subscriptionFacade.createSubscription('RequestEvent', request.requesterId, {
      type: 'request',
      id: request.id,
    });
  }
}
