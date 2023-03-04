import { InMemoryRepository } from '../../common/in-memory-repository';

import { Member } from './entities/member.entity';
import { MemberRepository } from './member.repository';

export class InMemoryMemberRepository extends InMemoryRepository<Member> implements MemberRepository {
  protected entity = Member;
}
