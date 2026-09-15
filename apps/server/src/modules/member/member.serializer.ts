import * as shared from '@sel/shared';
import { pick } from '@sel/utils';

import { Member, MemberWithAvatar } from './member.entities';

export function serializeMember(member: MemberWithAvatar): shared.LightMember {
  return {
    ...pick(member, ['id', 'firstName', 'lastName', 'number']),
    avatar: member.avatar?.name,
  };
}

export function serializeMemberContact(member: Member): Pick<shared.Member, 'email' | 'phoneNumber'> {
  return {
    email: member.emailVisible ? member.email : undefined,
    phoneNumber: member.phoneNumberVisible ? (member.phoneNumber ?? undefined) : undefined,
  };
}
