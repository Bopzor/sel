import * as shared from '@sel/shared';
import { pick } from '@sel/utils';

import { MemberWithAvatar } from './member.entities';

export function serializeMember(member: MemberWithAvatar): shared.LightMember {
  return {
    ...pick(member, ['id', 'firstName', 'lastName']),
    avatar: member.avatar?.name,
  };
}
