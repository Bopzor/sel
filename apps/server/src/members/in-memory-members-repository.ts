import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { InMemoryRepository } from '../in-memory.repository';

import { Member } from './entities/member';
import { MembersRepository } from './members-repository';

export class InMemoryMembersRepository extends InMemoryRepository<Member> implements MembersRepository {
  static inject = injectableClass(this);

  async listMembers(): Promise<shared.Member[]> {
    return this.all();
  }

  async getMember(memberId: string): Promise<shared.Member | undefined> {
    return this.get(memberId);
  }
}
