import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { createMember } from '../members/entities';
import { StubMembersFacade } from '../members/members.facade';
import { UnitTest } from '../unit-test';

import { createSubscription } from './entities';
import { InMemoryNotificationRepository } from './in-memory-notification.repository';
import { InMemorySubscriptionRepository } from './in-memory.subscription.repository';
import { SubscriptionService } from './subscription.service';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  membersFacade = new StubMembersFacade();
  subscriptionRepository = new InMemorySubscriptionRepository();
  notificationRepository = new InMemoryNotificationRepository();

  service = new SubscriptionService(
    this.generator,
    this.dateAdapter,
    this.membersFacade,
    this.subscriptionRepository,
    this.notificationRepository
  );

  setup(): void {
    this.generator.idValue = 'notificationId';
  }
}

describe('SubscriptionService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  describe('notify', () => {
    it('sends a notification to members subscribed to an event', async () => {
      test.membersFacade.members.push(createMember({ id: 'memberId' }));

      test.subscriptionRepository.add(
        createSubscription({ id: 'subscriptionId', memberId: 'memberId', type: 'NewAppVersion' })
      );

      await test.service.notify('NewAppVersion', () => ({
        title: 'title',
        content: 'content',
      }));

      const notification = test.notificationRepository.get('notificationId');

      expect(notification).toHaveProperty('id', 'notificationId');
      expect(notification).toHaveProperty('title', 'title');
      expect(notification).toHaveProperty('content', 'content');
    });
  });
});
