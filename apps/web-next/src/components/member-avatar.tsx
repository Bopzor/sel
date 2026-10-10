import type { LightMember } from '@sel/shared';
import { Avatar } from '@sel/ui';

import { fileUrl } from 'src/app/api';
import { formatMemberName } from 'src/app/format';

type MemberAvatarProps = Omit<React.ComponentProps<typeof Avatar>, 'name' | 'src'> & {
  member: Pick<LightMember, 'firstName' | 'lastName' | 'avatar'>;
};

export function MemberAvatar({ member, ...props }: MemberAvatarProps) {
  return (
    <Avatar
      name={formatMemberName(member)}
      src={member.avatar ? fileUrl(member.avatar) : undefined}
      {...props}
    />
  );
}
