import * as shared from '@sel/shared';

export interface MembersRepository {
  listMembers(): Promise<shared.Member[]>;
  getMember(memberId: string): Promise<shared.Member | undefined>;
}
