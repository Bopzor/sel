import { EventBus } from '@sel/cqs';
import { createDate } from '@sel/utils';

import { StubDate } from './infrastructure/date/stub-date.adapter';
import { StubGenerator } from './infrastructure/generator/stub-generator.adapter';
import { SubscriptionService } from './notifications/subscription.service';
import { InMemoryMemberRepository } from './persistence/repositories/member/in-memory-member.repository';
import { InMemoryNotificationRepository } from './persistence/repositories/notification/in-memory-notification.repository';
import { InMemorySubscriptionRepository } from './persistence/repositories/subscription/in-memory.subscription.repository';
import { UnitTest } from './unit-test';

export class NotificationTest extends UnitTest {
  now = createDate();

  generator = new StubGenerator();
  dateAdapter = new StubDate();
  eventBus = new EventBus();
  memberRepository = new InMemoryMemberRepository();
  subscriptionRepository = new InMemorySubscriptionRepository();
  notificationRepository = new InMemoryNotificationRepository(this.dateAdapter);

  subscriptionService = new SubscriptionService(
    this.generator,
    this.dateAdapter,
    this.eventBus,
    this.memberRepository,
    this.subscriptionRepository,
    this.notificationRepository,
  );

  constructor() {
    super();

    this.generator.nextId = 'notificationId';
    this.dateAdapter.date = this.now;
  }
}
