import { assert, hasId, negate } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommentsFacade } from '../comments/comments.facade';
import { TranslationPort } from '../infrastructure/translation/translation.port';
import { MembersFacade } from '../members/members.facade';
import { SubscriptionFacade } from '../notifications/subscription.facade';
import { TOKENS } from '../tokens';

import { RequestCommentCreated, RequestCreated } from './events';
import { RequestRepository } from './request.repository';

export class RequestNotificationsService {
  static inject = injectableClass(
    this,
    TOKENS.translation,
    TOKENS.subscriptionFacade,
    TOKENS.membersFacade,
    TOKENS.commentsFacade,
    TOKENS.requestRepository
  );

  constructor(
    private readonly translation: TranslationPort,
    private readonly subscriptionFacade: SubscriptionFacade,
    private readonly memberFacade: MembersFacade,
    private readonly commentsFacade: CommentsFacade,
    private readonly requestRepository: RequestRepository
  ) {}

  async notifyRequestCreated(event: RequestCreated): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const requester = await this.memberFacade.getMember(request?.requesterId);
    assert(requester);

    await this.subscriptionFacade.notify(
      //
      'RequestCreated',
      negate(hasId(requester.id)),
      () => ({
        type: 'RequestCreated',
        title: this.translation.translate('requestCreated.title', {
          requester: this.translation.memberName(requester),
        }),
        content: request.title,
        data: {
          request: {
            id: request.id,
            title: request.title,
          },
          requester: {
            id: requester.id,
            firstName: requester.firstName,
            lastName: requester.lastName,
          },
        },
      })
    );
  }

  async notifyCommentCreated(event: RequestCommentCreated): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const comment = await this.commentsFacade.getComment(event.commentId);
    assert(comment);

    const author = await this.memberFacade.getMember(comment.authorId);
    assert(author);

    await this.subscriptionFacade.notify(
      //
      'RequestEvent',
      negate(hasId(author.id)),
      () => ({
        type: 'RequestCommentCreated',
        title: this.translation.translate('requestCreated.title', {
          title: request.title,
        }),
        content: this.translation.translate('requestCreated.title', {
          author: this.translation.memberName(author),
          message: comment.text,
        }),
        data: {
          request: {
            id: request.id,
            title: request.title,
          },
          comment: {
            id: comment.id,
            message: comment.text,
            author: {
              id: author.id,
              firstName: author.firstName,
              lastName: author.lastName,
            },
          },
        },
      })
    );
  }
}
