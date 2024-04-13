import { NotificationData } from '@sel/shared';
import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { Database } from '../../persistence/database';
import { CommentRepository } from '../../persistence/repositories/comment/comment.repository';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { events } from '../../persistence/schema';
import { COMMANDS, TOKENS } from '../../tokens';
import { EventCommentCreated } from '../event-events';

export class NotifyEventCommentCreated implements EventHandler<EventCommentCreated> {
  static inject = injectableClass(
    this,
    TOKENS.commandBus,
    TOKENS.database,
    TOKENS.memberRepository,
    TOKENS.commentRepository,
  );

  constructor(
    private readonly commandBus: CommandBus,
    private readonly database: Database,
    private readonly memberRepository: MemberRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async handle({ entityId: eventId, commentId }: EventCommentCreated): Promise<void> {
    const event = await this.database.db.query.events.findFirst({ where: eq(events.id, eventId) });
    assert(event);

    const organizer = await this.memberRepository.getMember(event.organizerId);
    assert(organizer);

    const comment = await this.commentRepository.getComment(commentId);
    assert(comment);

    const author = await this.memberRepository.getMember(comment.authorId);
    assert(author);

    await this.commandBus.executeCommand(COMMANDS.notify, {
      subscriptionType: 'EventEvent',
      notificationType: 'EventCommentCreated',
      entityId: event.id,
      data: {
        event: {
          id: event.id,
          title: event.title,
          organizer: {
            id: event.organizerId,
            firstName: author.firstName,
            lastName: author.lastName,
          },
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
      } satisfies NotificationData['EventCommentCreated'],
    });
  }
}
