import { injected } from 'brandi';

import { OrmType } from '../../../../api/persistence/types';
import { TOKENS } from '../../../../api/tokens';
import { Member } from '../../entities/member.entity';
import { GetMemberResult } from '../../use-cases/get-member/get-member-result';
import { SqlMemberEntity } from '../entities/sql-member.entity';
import { MemberRepository } from '../member.repository';

export class SqlMemberRepository implements MemberRepository {
  constructor(private readonly orm: OrmType) {}

  get repository() {
    return this.orm.em.getRepository(SqlMemberEntity);
  }

  async listMembers(search?: string): Promise<GetMemberResult[]> {
    const getMembers = () => {
      if (!search) {
        return this.repository.findAll();
      }

      const $ilike = `%${search}%`;

      return this.repository.find({
        $or: [
          { email: { $ilike } },
          { firstName: { $ilike } },
          { lastName: { $ilike } },
          { phoneNumber: { $ilike } },
        ],
      });
    };

    const sqlMembers = await getMembers();

    return sqlMembers.map(SqlMemberRepository.memberToResult);
  }

  async getMember(memberId: string): Promise<GetMemberResult | undefined> {
    const sqlMember = await this.repository.findOne(memberId);

    if (sqlMember) {
      return SqlMemberRepository.memberToResult(sqlMember);
    }
  }

  async save(member: Member): Promise<void> {
    await this.repository.upsert(new SqlMemberEntity(member));
  }

  static memberToResult = (member: SqlMemberEntity): GetMemberResult => ({
    id: member.id,
    email: member.email,
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: [member.firstName, member.lastName].join(' '),
    phoneNumber: member.phoneNumber,
    address: {
      line1: member.address.line1,
      line2: member.address.line2,
      postalCode: member.address.postalCode,
      city: member.address.city,
      country: member.address.country,
      position: member.address.position,
    },
  });
}

injected(SqlMemberRepository, TOKENS.orm);
