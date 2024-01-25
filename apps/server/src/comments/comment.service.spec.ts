import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubEventPublisher } from '../infrastructure/events/stub-event-publisher';
import { InMemoryCommentRepository } from '../persistence/repositories/comment/in-memory-comment.repository';
import { UnitTest } from '../unit-test';

import { CommentCreated } from './comment-events';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

class Test extends UnitTest {
  dateAdapter = new StubDate();
  eventPublisher = new StubEventPublisher();
  commentsRepository = new InMemoryCommentRepository();

  service = new CommentService(this.dateAdapter, this.eventPublisher, this.commentsRepository);

  setup(): void {
    this.dateAdapter.date = createDate();
  }
}

describe('[Unit] CommentService', () => {
  let test: Test;

  beforeEach(() => {
    test = new Test();
  });

  describe('createComment', () => {
    it('creates a new comment', async () => {
      await test.service.createComment('commentId', 'request', 'requestId', 'authorId', 'body');

      expect(test.commentsRepository.get('commentId')).toEqual<Comment>({
        id: 'commentId',
        authorId: 'authorId',
        entityId: 'requestId',
        date: test.dateAdapter.date,
        text: 'body',
      });
    });

    it('triggers a CommentCreated domain event', async () => {
      await test.service.createComment('commentId', 'request', 'requestId', 'authorId', 'body');

      expect(test.eventPublisher).toHaveEmitted(new CommentCreated('commentId', 'request'));
    });
  });
});
