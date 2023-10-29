import * as shared from '@sel/shared';

import { Member } from './entities/member';

export interface MembersRepository {
  listMembers(sort: shared.MembersSort): Promise<shared.Member[]>;
  getMember(memberId: string): Promise<shared.Member | undefined>;
  getMemberFromEmail(email: string): Promise<Member | undefined>;
}
