import { useQuery } from '../../../app/api.context';
import { Spinner } from '../../../app/components/spinner';
import { assert } from '../../../utils/assert';
import { gravatarUrl } from '../../../utils/gravatar';
import { GetMemberHandler } from '../use-cases/get-member/get-member';

export const MemberAvatarName = () => {
  const [member, { loading }] = useQuery(GetMemberHandler, { id: 'nils' });

  if (loading) {
    return <Spinner className="h-4 w-3 fill-white" />;
  }

  // TODO remove
  assert(member);

  return (
    <div className="col items-center">
      <img className="h-3 w-3 rounded-full" src={gravatarUrl(member.email)} alt="member" />
      <span className="font-medium">{member.fullName}</span>
    </div>
  );
};
