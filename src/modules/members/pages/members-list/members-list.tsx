import { Members } from '../../aliases';
import { MemberAvatarName } from '../../components/member-avatar-name';

type MembersListProps = {
  members: Members;
};

export const MembersList = ({ members }: MembersListProps) => (
  <div className="col gap-1">
    {members.map((member) => (
      <MemberItem key={member.id} member={member} />
    ))}
  </div>
);

type MemberItemProps = {
  member: Members[number];
};

const MemberItem = ({ member }: MemberItemProps) => <MemberAvatarName inline size="small" member={member} />;
