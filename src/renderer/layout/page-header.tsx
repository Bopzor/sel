import { Spinner } from '../../app/components/spinner';
import { useQuery } from '../../app/hooks/use-query';
import { Translation } from '../../app/i18n.context';
import { MemberAvatarName } from '../../modules/members/components/member-avatar-name';
import { TOKENS } from '../../tokens';
import { assert } from '../../utils/assert';

import logo from './logo.png';

const T = Translation.create('layout');

export const PageHeader = () => (
  <header className="bg-primary py-1 text-inverted">
    <div className="content row items-center">
      <a href="/" className="row mr-auto items-center gap-2">
        <img src={logo} alt="Logo" width={64} height={64} />
        <span className="text-lg font-semibold md:text-xl">
          <T>Local trading system</T>
        </span>
      </a>

      <AuthenticatedMemberAvatarName />
    </div>
  </header>
);

const AuthenticatedMemberAvatarName = () => {
  const [member, { loading }] = useQuery(TOKENS.getMemberHandler, { id: 'nils' });

  if (loading) {
    return <Spinner className="h-4 w-3 fill-white" />;
  }

  // TODO remove
  assert(member);

  return <MemberAvatarName member={member} />;
};
