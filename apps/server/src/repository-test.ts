import { ClassType } from '@sel/utils';
import { injectableClass } from 'ditox';

import { Token } from './authentication/token.entity';
import { StubConfigAdapter } from './infrastructure/config/stub-config.adapter';
import { DatePort } from './infrastructure/date/date.port';
import { StubDate } from './infrastructure/date/stub-date.adapter';
import { Member } from './members/entities';
import { Notification, Subscription } from './notifications/entities';
import { Database } from './persistence/database';
import { members, requests, tokens, subscriptions, notifications } from './persistence/schema';
import { Request } from './requests/request.entity';
import { TOKENS } from './tokens';

export class RepositoryTest {
  config = new StubConfigAdapter({
    database: {
      url: process.env.DATABASE_URL ?? 'postgres://postgres@localhost/test',
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

  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

  private get db() {
    return this.database.db;
  }

  private get now() {
    return this.dateAdapter.now();
  }

  async member(member: Member): Promise<Member> {
    await this.db.insert(members).values({
      ...member,
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
      createdAt: this.now,
      updatedAt: this.now,
    });

    return notification;
  }
}
