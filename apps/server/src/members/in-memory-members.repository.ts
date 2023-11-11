import { Address, AuthenticatedMember, Member, PhoneNumber } from '@sel/shared';
import { defined } from '@sel/utils';

import { InMemoryRepository } from '../in-memory.repository';

import { InsertMemberModel, MembersRepository, UpdateMemberModel } from './members.repository';

type InMemoryMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVisible: boolean;
  phoneNumbers: PhoneNumber[];
  bio?: string;
  address?: Address;
  onboardingCompleted: boolean;
};

export class InMemoryMembersRepository
  extends InMemoryRepository<InMemoryMember>
  implements MembersRepository
{
  async listMembers(): Promise<Member[]> {
    return this.all().map(this.toMember);
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    const member = this.get(memberId);

    if (member) {
      return this.toMember(member);
    }
  }

  async getAuthenticatedMember(memberId: string): Promise<AuthenticatedMember | undefined> {
    const member = this.get(memberId);

    if (member) {
      return this.toAuthenticatedMember(member);
    }
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    return this.find((member) => member.email === email);
  }

  async insert(member: InsertMemberModel): Promise<void> {
    this.add({
      ...member,
      emailVisible: true,
      phoneNumbers: [],
      onboardingCompleted: false,
    });
  }

  async update(memberId: string, model: UpdateMemberModel): Promise<void> {
    this.add({
      ...defined(this.get(memberId)),
      ...model,
    });
  }

  async setOnboardingCompleted(memberId: string, completed: boolean): Promise<void> {
    this.add({
      ...defined(this.get(memberId)),
      onboardingCompleted: completed,
    });
  }

  private toMember(this: void, member: InMemoryMember): Member {
    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.emailVisible ? member.email : undefined,
      phoneNumbers: member.phoneNumbers.filter(({ visible }) => visible),
      bio: member.bio,
      address: member.address,
    };
  }

  private toAuthenticatedMember(this: void, member: InMemoryMember): AuthenticatedMember {
    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      emailVisible: member.emailVisible,
      phoneNumbers: member.phoneNumbers,
      bio: member.bio,
      address: member.address,
      onboardingCompleted: member.onboardingCompleted,
    };
  }
}
