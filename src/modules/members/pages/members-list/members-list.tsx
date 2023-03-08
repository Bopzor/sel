import { Members } from '../../aliases';
import { MemberAvatarName } from '../../components/member-avatar-name';

type MembersListProps = {
  members: Members;
};

export const MembersList = ({ members }: MembersListProps) => (
  <div className="col flex-1 overflow-y-auto px-1">
    {members.map((member) => (
      <MemberItem key={member.id} member={member} />
    ))}
  </div>
);

type MemberItemProps = {
  member: Members[number];
};

const MemberItem = ({ member }: MemberItemProps) => (
  <a href={`/membres/${member.id}`} className="py-0.5">
    <MemberAvatarName inline size="small" member={member} />
  </a>
);
