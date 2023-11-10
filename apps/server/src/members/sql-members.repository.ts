import { Address, Member, MembersSort, PhoneNumber } from '@sel/shared';
import { injectableClass } from 'ditox';
import { asc, desc, eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { members } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { InsertMemberModel, MembersRepository } from './members.repository';

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

    return results.map(this.toEntity);
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    const [result] = await this.db.select().from(members).where(eq(members.id, memberId));

    if (result) {
      return this.toEntity(result);
    }
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    const [sqlMember] = await this.db.select().from(members).where(eq(members.email, email));

    if (sqlMember) {
      return this.toEntity(sqlMember);
    }
  }

  async insert(member: InsertMemberModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.db.insert(members).values({
      ...member,
      emailVisible: true,
      bio: null,
      address: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  private toEntity(this: void, result: typeof members.$inferSelect): Member {
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
}
