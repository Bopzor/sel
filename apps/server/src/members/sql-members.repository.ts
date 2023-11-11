import { Address, AuthenticatedMember, Member, MembersSort, PhoneNumber } from '@sel/shared';
import { injectableClass } from 'ditox';
import { asc, desc, eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { members } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { InsertMemberModel, MembersRepository, UpdateMemberModel } from './members.repository';

export class SqlMembersRepository implements MembersRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private database: Database, private readonly dateAdapter: DatePort) {}

  private get db() {
    return this.database.db;
  }

  async listMembers(sort: MembersSort): Promise<Member[]> {
    const orderBy = {
      [MembersSort.firstName]: asc(members.firstName),
      [MembersSort.lastName]: asc(members.lastName),
      [MembersSort.subscriptionDate]: desc(members.createdAt),
    };

    const results = await this.db.select().from(members).orderBy(orderBy[sort]);

    return results.map(this.toMember);
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    const [result] = await this.db.select().from(members).where(eq(members.id, memberId));

    if (result) {
      return this.toMember(result);
    }
  }

  async getAuthenticatedMember(memberId: string): Promise<AuthenticatedMember | undefined> {
    const [result] = await this.db.select().from(members).where(eq(members.id, memberId));

    if (result) {
      return this.toAuthenticatedMember(result);
    }
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    const [sqlMember] = await this.db.select().from(members).where(eq(members.email, email));

    if (sqlMember) {
      return this.toMember(sqlMember);
    }
  }

  async insert(model: InsertMemberModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.db.insert(members).values({
      ...model,
      emailVisible: true,
      bio: null,
      address: null,
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
      email: result.emailVisible ? result.email : undefined,
      phoneNumbers: (result.phoneNumbers as PhoneNumber[]).filter(({ visible }) => visible),
      bio: result.bio ?? undefined,
      address: (result.address as Address | null) ?? undefined,
    };
  }

  private toAuthenticatedMember(this: void, result: typeof members.$inferSelect): AuthenticatedMember {
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
