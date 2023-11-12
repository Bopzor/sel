import * as shared from '@sel/shared';

import { Address, Member, MemberStatus } from './entities';

export type InsertMemberModel = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type UpdateMemberModel = {
  firstName: string;
  lastName: string;
  emailVisible: boolean;
  phoneNumbers: Array<{ number: string; visible: boolean }>;
  bio?: string;
  address?: Address;
};

export interface MembersRepository {
  query_listMembers(sort: shared.MembersSort): Promise<shared.Member[]>;
  query_getMember(memberId: string): Promise<shared.Member | undefined>;
  query_getAuthenticatedMember(memberId: string): Promise<shared.AuthenticatedMember | undefined>;

  getMember(memberId: string): Promise<Member | undefined>;
  getMemberFromEmail(email: string): Promise<Member | undefined>;
  insert(model: InsertMemberModel): Promise<void>;
  update(memberId: string, model: UpdateMemberModel): Promise<void>;
  setStatus(memberId: string, status: MemberStatus): Promise<void>;
}
