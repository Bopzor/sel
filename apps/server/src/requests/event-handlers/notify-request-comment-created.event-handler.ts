import { assert, hasId, negate } from '@sel/utils';
import { injectableClass } from 'ditox';

import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { SubscriptionService } from '../../notifications/subscription.service';
import { CommentRepository } from '../../persistence/repositories/comment/comment.repository';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';
import { RequestCommentCreated } from '../request-events';

export class NotifyRequestCommentCreated {
  static inject = injectableClass(
    this,
    TOKENS.translation,
    TOKENS.memberRepository,
    TOKENS.commentRepository,
    TOKENS.requestRepository,
    TOKENS.subscriptionService
  );

  constructor(
    private readonly translation: TranslationPort,
    private readonly memberRepository: MemberRepository,
    private readonly commentRepository: CommentRepository,
    private readonly requestRepository: RequestRepository,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async handle(event: RequestCommentCreated): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const comment = await this.commentRepository.getComment(event.commentId);
    assert(comment);

    const author = await this.memberRepository.getMember(comment.authorId);
    assert(author);

    await this.subscriptionService.notify(
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
