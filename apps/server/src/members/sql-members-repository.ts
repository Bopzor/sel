import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { InferSelectModel, asc, desc, eq } from 'drizzle-orm';

import { Database } from '../infrastructure/persistence/database';
import { members } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { MembersRepository, MembersSort } from './members-repository';

export class SqlMembersRepository implements MembersRepository {
  static inject = injectableClass(this, TOKENS.database);

  constructor(private database: Database) {}

  private get db() {
    return this.database.db;
  }

  async listMembers(sort: MembersSort): Promise<shared.Member[]> {
    const orderBy = {
      [MembersSort.firstName]: asc(members.firstName),
      [MembersSort.lastName]: asc(members.lastName),
      [MembersSort.subscriptionDate]: desc(members.createdAt),
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

  private sqlToMember(this: void, result: InferSelectModel<typeof members>): shared.Member {
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      phoneNumbers: result.phoneNumbers as string[],
      bio: result.bio ?? undefined,
      address: (result.address as shared.Address | null) ?? undefined,
    };
  }
}
