import { Address, AuthenticatedMember, Member, MembersSort } from '@sel/shared';

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
  listMembers(sort: MembersSort): Promise<Member[]>;
  getMember(memberId: string): Promise<Member | undefined>;
  getAuthenticatedMember(memberId: string): Promise<AuthenticatedMember | undefined>;
  getMemberFromEmail(email: string): Promise<Member | undefined>;
  insert(model: InsertMemberModel): Promise<void>;
  update(memberId: string, model: UpdateMemberModel): Promise<void>;
  setOnboardingCompleted(memberId: string, completed: boolean): Promise<void>;
}
