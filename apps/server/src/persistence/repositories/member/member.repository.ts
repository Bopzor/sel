import * as shared from '@sel/shared';

import { NotificationDeliveryType } from '../../../common/notification-delivery-type';
import { Address, Member, MemberStatus } from '../../../members/member.entity';

export type InsertMemberModel = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  notificationDelivery: Record<NotificationDeliveryType, boolean>;
};

export type UpdateMemberModel = {
  firstName: string;
  lastName: string;
  emailVisible: boolean;
  phoneNumbers: Array<{ number: string; visible: boolean }>;
  bio?: string;
  address?: Address;
};

export interface MemberRepository {
  query_listMembers(sort: shared.MembersSort): Promise<shared.Member[]>;
  query_getMember(memberId: string): Promise<shared.Member | undefined>;
  query_getAuthenticatedMember(memberId: string): Promise<shared.AuthenticatedMember | undefined>;

  getMember(memberId: string): Promise<Member | undefined>;
  getMembers(memberIds: string[]): Promise<Member[]>;
  getMemberFromEmail(email: string): Promise<Member | undefined>;
  insert(model: InsertMemberModel): Promise<void>;
  update(memberId: string, model: UpdateMemberModel): Promise<void>;
  setStatus(memberId: string, status: MemberStatus): Promise<void>;
  setNotificationDelivery(
    memberId: string,
    delivery: Partial<Record<NotificationDeliveryType, boolean>>
  ): Promise<void>;
}
