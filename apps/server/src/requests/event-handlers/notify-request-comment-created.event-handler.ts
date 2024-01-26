import { NotificationData } from '@sel/shared';
import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { CommentRepository } from '../../persistence/repositories/comment/comment.repository';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { COMMANDS, TOKENS } from '../../tokens';
import { RequestCommentCreated } from '../request-events';

export class NotifyRequestCommentCreated implements EventHandler<RequestCommentCreated> {
  static inject = injectableClass(
    this,
    TOKENS.commandBus,
    TOKENS.memberRepository,
    TOKENS.commentRepository,
    TOKENS.requestRepository
  );

  constructor(
    private readonly commandBus: CommandBus,
    private readonly memberRepository: MemberRepository,
    private readonly commentRepository: CommentRepository,
    private readonly requestRepository: RequestRepository
  ) {}

  async handle(event: RequestCommentCreated): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const comment = await this.commentRepository.getComment(event.commentId);
    assert(comment);

    const author = await this.memberRepository.getMember(comment.authorId);
    assert(author);

    await this.commandBus.executeCommand(COMMANDS.createNotification, {
      subscriptionType: 'RequestEvent',
      notificationType: 'RequestCommentCreated',
      entity: {
        type: 'request',
        id: request.id,
      },
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
      } satisfies NotificationData['RequestCommentCreated'],
    });
  }
}
