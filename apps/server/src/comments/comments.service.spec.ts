import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubEventsAdapter } from '../infrastructure/events/stub-events.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { UnitTest } from '../unit-test';

import { CommentsService } from './comments.service';
import { Comment } from './entities';
import { CommentCreatedEvent } from './events';
import { InMemoryCommentsRepository } from './in-memory-comments.repository';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  events = new StubEventsAdapter();
  commentsRepository = new InMemoryCommentsRepository();

  service = new CommentsService(this.generator, this.dateAdapter, this.events, this.commentsRepository);

  now = createDate();

  setup(): void {
    this.dateAdapter.date = this.now;
  }
}

describe('CommentsService', () => {
  let test: Test;

  beforeEach(() => {
    test = new Test();
  });

  describe('createComment', () => {
    beforeEach(() => {
      test.generator.idValue = 'commentId';
    });

    it('creates a new comment', async () => {
      await test.service.createComment('request', 'requestId', 'authorId', 'body');

      expect(test.commentsRepository.get('commentId')).toEqual<Comment>({
        id: 'commentId',
        authorId: 'authorId',
        date: test.now,
        body: 'body',
      });
    });

    it('triggers a CommentCreated domain event', async () => {
      await test.service.createComment('request', 'requestId', 'authorId', 'body');

      expect(test.events).toHaveEmitted(new CommentCreatedEvent('commentId'));
    });
  });
});