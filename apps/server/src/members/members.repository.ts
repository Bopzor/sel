import * as shared from '@sel/shared';

export interface MembersRepository {
  listMembers(sort: shared.MembersSort): Promise<shared.Member[]>;
  getMember(memberId: string): Promise<shared.Member | undefined>;
}
