import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubEventsAdapter } from '../infrastructure/events/stub-events.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { InMemoryCommentRepository } from '../persistence/repositories/comment/in-memory-comment.repository';
import { UnitTest } from '../unit-test';

import { CommentsService } from './comments.service';
import { Comment } from './entities';
import { CommentCreated } from './events';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  events = new StubEventsAdapter();
  commentsRepository = new InMemoryCommentRepository();

  service = new CommentsService(this.generator, this.dateAdapter, this.events, this.commentsRepository);

  setup(): void {
    this.dateAdapter.date = createDate();
  }
}

describe('CommentsService', () => {
  let test: Test;

  beforeEach(() => {
    test = new Test();
  });

  describe('createComment', () => {
    beforeEach(() => {
      test.generator.nextId = 'commentId';
    });

    it('creates a new comment', async () => {
      expect(await test.service.createComment('request', 'requestId', 'authorId', 'body')).toEqual(
        'commentId'
      );

      expect(test.commentsRepository.get('commentId')).toEqual<Comment>({
        id: 'commentId',
        authorId: 'authorId',
        entityId: 'requestId',
        date: test.dateAdapter.date,
        text: 'body',
      });
    });

    it('triggers a CommentCreated domain event', async () => {
      await test.service.createComment('request', 'requestId', 'authorId', 'body');

      expect(test.events).toHaveEmitted(new CommentCreated('commentId', 'request'));
    });
  });
});
