/* eslint-disable jsx-a11y/mouse-events-have-key-events */

import clsx from 'clsx';

import { MemberAvatarName } from '../../components/member-avatar-name';
import { Member } from '../../index';

type MembersListProps = {
  members: Member[];
  setActive: (member: Member | undefined) => void;
};

export const MembersList = ({ members, setActive }: MembersListProps) => (
  <div className="col flex-1 overflow-y-auto" onMouseOut={() => setActive(undefined)}>
    {members.map((member) => (
      <MemberItem key={member.id} member={member} onHover={() => setActive(member)} />
    ))}
  </div>
);

type MemberItemProps = {
  member: Member;
  onHover: () => void;
};

const MemberItem = ({ member, onHover }: MemberItemProps) => (
  <a href={`/membres/${member.id}`} className={clsx('px-1 py-0.5 hover:bg-inverted/5')} onMouseOver={onHover}>
    <MemberAvatarName inline size="small" member={member} />
  </a>
);
