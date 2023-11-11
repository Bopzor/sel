import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { asc, desc, eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { members } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { Address, Member, PhoneNumber } from './entities';
import { InsertMemberModel, MembersRepository, UpdateMemberModel } from './members.repository';

export class SqlMembersRepository implements MembersRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private database: Database, private readonly dateAdapter: DatePort) {}

  private get db() {
    return this.database.db;
  }

  async query_listMembers(sort: shared.MembersSort): Promise<shared.Member[]> {
    const orderBy = {
      [shared.MembersSort.firstName]: asc(members.firstName),
      [shared.MembersSort.lastName]: asc(members.lastName),
      [shared.MembersSort.subscriptionDate]: desc(members.createdAt),
    };

    const results = await this.db.select().from(members).orderBy(orderBy[sort]);

    return results.map(this.toMemberQuery);
  }

  async query_getMember(memberId: string): Promise<shared.Member | undefined> {
    const [result] = await this.db.select().from(members).where(eq(members.id, memberId));

    if (result) {
      return this.toMemberQuery(result);
    }
  }

  async query_getAuthenticatedMember(memberId: string): Promise<shared.AuthenticatedMember | undefined> {
    const [result] = await this.db.select().from(members).where(eq(members.id, memberId));

    if (result) {
      return this.toAuthenticatedMemberQuery(result);
    }
  }

  private toMemberQuery(this: void, result: typeof members.$inferSelect): shared.Member {
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.emailVisible ? result.email : undefined,
      phoneNumbers: (result.phoneNumbers as shared.PhoneNumber[]).filter(({ visible }) => visible),
      bio: result.bio ?? undefined,
      address: (result.address as shared.Address | null) ?? undefined,
    };
  }

  private toAuthenticatedMemberQuery(
    this: void,
    result: typeof members.$inferSelect
  ): shared.AuthenticatedMember {
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      emailVisible: result.emailVisible,
      phoneNumbers: result.phoneNumbers as shared.PhoneNumber[],
      bio: result.bio ?? undefined,
      address: (result.address as shared.Address | null) ?? undefined,
      onboardingCompleted: result.onboardingCompletedDate !== null,
    };
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    const [result] = await this.db.select().from(members).where(eq(members.id, memberId));

    if (result) {
      return this.toMember(result);
    }
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    const [result] = await this.db.select().from(members).where(eq(members.email, email));

    if (result) {
      return this.toMember(result);
    }
  }

  async insert(model: InsertMemberModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.db.insert(members).values({
      id: model.id,
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      emailVisible: true,
      phoneNumbers: [],
      bio: null,
      address: null,
      onboardingCompletedDate: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  async update(memberId: string, model: UpdateMemberModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.db
      .update(members)
      .set({
        firstName: model.firstName,
        lastName: model.lastName,
        emailVisible: model.emailVisible,
        phoneNumbers: model.phoneNumbers,
        bio: model.bio ?? null,
        address: model.address ?? null,
        updatedAt: now.toISOString(),
      })
      .where(eq(members.id, memberId));
  }

  async setOnboardingCompleted(memberId: string, completed: boolean): Promise<void> {
    const now = this.dateAdapter.now();

    await this.db
      .update(members)
      .set({
        onboardingCompletedDate: completed ? now.toISOString() : null,
        updatedAt: now.toISOString(),
      })
      .where(eq(members.id, memberId));
  }

  private toMember(this: void, result: typeof members.$inferSelect): Member {
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      emailVisible: result.emailVisible,
      phoneNumbers: result.phoneNumbers as PhoneNumber[],
      bio: result.bio ?? undefined,
      address: (result.address as Address | null) ?? undefined,
      onboardingCompleted: result.onboardingCompletedDate !== null,
    };
  }
}
