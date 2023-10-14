import * as shared from '@sel/shared';

export enum MembersSort {
  firstName = 'firstName',
  lastName = 'lastName',
  subscriptionDate = 'subscriptionDate',
}

export interface MembersRepository {
  listMembers(sort: MembersSort): Promise<shared.Member[]>;
  getMember(memberId: string): Promise<shared.Member | undefined>;
}
