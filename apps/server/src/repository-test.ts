import { ClassType, entries } from '@sel/utils';
import { injectableClass } from 'ditox';

import { Token } from './authentication/token.entity';
import { StubConfigAdapter } from './infrastructure/config/stub-config.adapter';
import { DatePort } from './infrastructure/date/date.port';
import { StubDate } from './infrastructure/date/stub-date.adapter';
import { Member } from './members/member.entity';
import { Notification } from './notifications/notification.entity';
import { Subscription } from './notifications/subscription.entity';
import { Database } from './persistence/database';
import { members, notifications, requests, subscriptions, tokens } from './persistence/schema';
import { Request } from './requests/request.entity';
import { TOKENS } from './tokens';

export class RepositoryTest {
  config = new StubConfigAdapter({
    database: {
      url: process.env.DATABASE_URL ?? 'postgres://postgres@localhost/test',
      debug: process.env.DATABASE_URL === 'true',
    },
  });

  database = new Database(this.config);

  dateAdapter = new StubDate();

  persist = new Persistor(this.database, this.dateAdapter);

  static async create<Test extends RepositoryTest>(TestClass: ClassType<Test>) {
    const test = new TestClass();

    await test.database.ensureTestDatabase();
    await test.database.migrate();
    await test.database.reset();

    await test.setup?.();

    return test;
  }

  setup?(): Promise<void>;
}

export class Persistor {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(
    private readonly database: Database,
    private readonly dateAdapter: DatePort,
  ) {}

  private get db() {
    return this.database.db;
  }

  private get now() {
    return this.dateAdapter.now();
  }

  async member(member: Member): Promise<Member> {
    await this.db.insert(members).values({
      ...member,
      notificationDelivery: entries(member.notificationDelivery)
        .filter(([, value]) => value)
        .map(([key]) => key),
      createdAt: this.now,
      updatedAt: this.now,
    });

    return member;
  }

  async request(request: Request): Promise<Request> {
    await this.db.insert(requests).values({
      ...request,
      ...request.body,
      createdAt: this.now,
      updatedAt: this.now,
    });

    return request;
  }

  async token(token: Token): Promise<Token> {
    await this.db.insert(tokens).values({
      ...token,
      createdAt: this.now,
      updatedAt: this.now,
    });

    return token;
  }

  async subscription(subscription: Subscription): Promise<Subscription> {
    await this.db.insert(subscriptions).values({
      ...subscription,
      active: true,
      createdAt: this.now,
      updatedAt: this.now,
    });

    return subscription;
  }

  async notification(notification: Notification): Promise<Notification> {
    await this.db.insert(notifications).values({
      ...notification,
      deliveryType: entries(notification.deliveryType)
        .filter(([, value]) => value)
        .map(([key]) => key),
      createdAt: this.now,
      updatedAt: this.now,
    });

    return notification;
  }
}
