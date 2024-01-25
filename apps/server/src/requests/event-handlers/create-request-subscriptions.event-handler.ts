import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { SubscriptionService } from '../../notifications/subscription.service';
import { CommentRepository } from '../../persistence/repositories/comment/comment.repository';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';
import { RequestCommentCreated, RequestCreated } from '../request-events';

export class CreateRequestSubscription implements EventHandler<RequestCreated | RequestCommentCreated> {
  static inject = injectableClass(
    this,
    TOKENS.requestRepository,
    TOKENS.commentRepository,
    TOKENS.subscriptionService
  );

  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly commentRepository: CommentRepository,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async handle(event: RequestCreated | RequestCommentCreated): Promise<void> {
    if (event instanceof RequestCreated) {
      const request = defined(await this.requestRepository.getRequest(event.entityId));

      await this.subscriptionService.createSubscription('RequestEvent', request.requesterId, {
        type: 'request',
        id: request.id,
      });
    }

    if (event instanceof RequestCommentCreated) {
      const comment = defined(await this.commentRepository.getComment(event.commentId));

      await this.subscriptionService.createSubscription('RequestEvent', comment.authorId, {
        type: 'request',
        id: event.entityId,
      });
    }
  }
}
