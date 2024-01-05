import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { UnitTest } from '../unit-test';

import { Notification, createSubscription } from './entities';
import { InMemoryNotificationRepository } from './in-memory-notification.repository';
import { InMemorySubscriptionRepository } from './in-memory.subscription.repository';
import { SubscriptionService } from './subscription.service';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  subscriptionRepository = new InMemorySubscriptionRepository();
  notificationRepository = new InMemoryNotificationRepository();

  service = new SubscriptionService(
    this.generator,
    this.dateAdapter,
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
    it('sends a notification to membres subscribed to an event', async () => {
      test.subscriptionRepository.add(
        createSubscription({ id: 'subscriptionId', eventType: 'NewAppVersion' })
      );

      await test.service.notify('NewAppVersion');

      expect(test.notificationRepository.get('notificationId')).toEqual<Notification>({
        id: 'notificationId',
      });
    });
  });
});
