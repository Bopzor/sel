import type { LightMember } from '@sel/shared';
import { Avatar } from '@sel/ui';

const baseUrl = import.meta.env.VITE_API_URL ?? '/api';

export function MemberAvatar({
  member,
  ...props
}: { member: LightMember } & Omit<React.ComponentProps<typeof Avatar>, 'name' | 'src'>) {
  return (
    <Avatar
      name={`${member.firstName} ${member.lastName}`}
      src={member.avatar ? `${baseUrl}/files/${member.avatar}` : undefined}
      {...props}
    />
  );
}
