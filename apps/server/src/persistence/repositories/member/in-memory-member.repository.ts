import * as shared from '@sel/shared';
import { assert, createDate, defined } from '@sel/utils';

import { NotificationDeliveryType } from '../../../common/notification-delivery-type';
import { InMemoryRepository } from '../../../in-memory.repository';
import { MemberNotFound } from '../../../members/member-errors';
import { Member, MemberStatus } from '../../../members/member.entity';

import { InsertMemberModel, MemberRepository, UpdateMemberModel } from './member.repository';

export class InMemoryMemberRepository extends InMemoryRepository<Member> implements MemberRepository {
  async query_listMembers(): Promise<shared.Member[]> {
    return this.all().map(this.toMemberQuery);
  }

  async query_getMember(memberId: string): Promise<shared.Member | undefined> {
    const member = this.get(memberId);

    if (member) {
      return this.toMemberQuery(member);
    }
  }

  async query_getAuthenticatedMember(memberId: string): Promise<shared.AuthenticatedMember | undefined> {
    const member = this.get(memberId);

    if (member) {
      return this.toAuthenticatedMemberQuery(member);
    }
  }

  private toMemberQuery(this: void, member: Member): shared.Member {
    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.emailVisible ? member.email : undefined,
      phoneNumbers: member.phoneNumbers.filter(({ visible }) => visible),
      bio: member.bio,
      address: member.address,
      membershipStartDate: member.membershipStartDate.toISOString(),
      balance: 0,
      interests: [],
    };
  }

  private toAuthenticatedMemberQuery(this: void, member: Member): shared.AuthenticatedMember {
    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      emailVisible: member.emailVisible,
      phoneNumbers: member.phoneNumbers,
      bio: member.bio,
      address: member.address,
      onboardingCompleted: member.status !== MemberStatus.onboarding,
      membershipStartDate: member.membershipStartDate.toISOString(),
      notificationDelivery: member.notificationDelivery,
      balance: 0,
      interests: [],
    };
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    return this.find((member) => member.email === email);
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    return this.get(memberId);
  }

  async getMemberOrFail(memberId: string): Promise<Member> {
    const member = await this.getMember(memberId);

    if (!member) {
      throw new MemberNotFound(memberId);
    }

    return member;
  }

  async getMembers(memberIds: string[]): Promise<Member[]> {
    return this.filter((member) => memberIds.includes(member.id));
  }

  async insert(model: InsertMemberModel): Promise<void> {
    this.add({
      ...model,
      status: MemberStatus.inactive,
      emailVisible: true,
      phoneNumbers: [],
      membershipStartDate: createDate(),
    });
  }

  async update(memberId: string, model: UpdateMemberModel): Promise<void> {
    const member = this.get(memberId);

    assert(member);

    if (!('bio' in model)) {
      delete member.bio;
    }

    if (!('address' in model)) {
      delete member.address;
    }

    this.add({
      ...member,
      ...model,
    });
  }

  async setStatus(memberId: string, status: MemberStatus): Promise<void> {
    this.add({
      ...defined(this.get(memberId)),
      status,
    });
  }

  async setNotificationDelivery(
    memberId: string,
    delivery: Partial<Record<NotificationDeliveryType, boolean>>,
  ): Promise<void> {
    const member = defined(this.get(memberId));

    this.add({
      ...member,
      notificationDelivery: { ...member.notificationDelivery, ...delivery },
    });
  }
}
