import { useQuery } from '../../../app/api.context';
import { assert } from '../../../utils/assert';
import { gravatarUrl } from '../../../utils/gravatar';
import { GetMemberQueryHandler } from '../use-cases/get-member/get-member';

export const MemberAvatarName = () => {
  const [member] = useQuery(GetMemberQueryHandler, { id: 'nils' });

  // TODO remove
  assert(member);

  return (
    <div className="col items-center">
      <img className="h-3 w-3 rounded-full" src={gravatarUrl(member.email)} alt="member" />
      <span className="font-medium">{member.fullName}</span>
    </div>
  );
};
