import { injectableClass } from 'ditox';

import { Token } from './authentication/token.entity';
import { DatePort } from './infrastructure/date/date.port';
import { Database } from './infrastructure/persistence/database';
import { members, requests, subscriptions, tokens } from './infrastructure/persistence/schema';
import { Member } from './members/entities';
import { Subscription } from './notifications/entities';
import { Request } from './requests/request.entity';
import { TOKENS } from './tokens';

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
}
