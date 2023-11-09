import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { asc, desc, eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { members } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { Address } from './entities/address';
import { Member } from './entities/member';
import { MembersRepository } from './members.repository';

export class SqlMembersRepository implements MembersRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private database: Database, private readonly dateAdapter: DatePort) {}

  private get db() {
    return this.database.db;
  }

  async listMembers(sort: shared.MembersSort): Promise<shared.Member[]> {
    const orderBy = {
      [shared.MembersSort.firstName]: asc(members.firstName),
      [shared.MembersSort.lastName]: asc(members.lastName),
      [shared.MembersSort.subscriptionDate]: desc(members.createdAt),
    };

    const results = await this.db.select().from(members).orderBy(orderBy[sort]);

    return results.map(this.sqlToMember);
  }

  async getMember(memberId: string): Promise<shared.Member | undefined> {
    const [result] = await this.db.select().from(members).where(eq(members.id, memberId));

    if (result) {
      return this.sqlToMember(result);
    }
  }

  private sqlToMember(this: void, result: typeof members.$inferSelect): shared.Member {
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      phoneNumbers: result.phoneNumbers as string[],
      bio: result.bio ?? undefined,
      address: (result.address as shared.Address | null) ?? undefined,
      onboardingCompleted: Boolean(result.onboardingCompletedDate),
    };
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    const [sqlMember] = await this.db.select().from(members).where(eq(members.email, email));

    if (sqlMember) {
      return this.sqlToEntity(sqlMember);
    }
  }

  private sqlToEntity(this: void, result: typeof members.$inferSelect): Member {
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      phoneNumbers: result.phoneNumbers as string[],
      bio: result.bio ?? undefined,
      address: (result.address as Address | null) ?? undefined,
    };
  }

  async insert(member: Member): Promise<void> {
    const now = this.dateAdapter.now();

    await this.db.insert(members).values({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phoneNumbers: member.phoneNumbers,
      bio: member.bio ?? null,
      address: member.address ?? null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }
}
