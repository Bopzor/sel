import clsx from 'clsx';

import { gravatarUrl } from '../../../utils/gravatar';
import { Member } from '../aliases';

type MemberAvatarNameProps = {
  className?: string;
  inline?: boolean;
  size?: 'small';
  member: Pick<Member, 'id' | 'email' | 'fullName'>;
};

export const MemberAvatarName = ({ className, inline, size, member }: MemberAvatarNameProps) => (
  <div className={clsx('items-center gap-0.5 font-medium', inline ? 'row' : 'col', className)}>
    <img
      className={clsx(' rounded-full', size === 'small' ? 'h-2 w-2' : 'h-3 w-3')}
      src={gravatarUrl(member.email)}
      alt="member"
    />
    <span className="font-medium">{member.fullName}</span>
  </div>
);