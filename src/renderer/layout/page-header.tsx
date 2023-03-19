import { FRONT_TOKENS } from '../../app/front-tokens';
import { useQuery } from '../../app/hooks/use-query';
import { Translation } from '../../app/i18n.context';
import { MemberAvatarName } from '../../modules/members/components/member-avatar-name';
import { usePathname } from '../page-context';

import { Navigation } from './header-navigation';
import logo from './logo.png';

const T = Translation.create('layout');

export const PageHeader = () => {
  const [member, { error }] = useQuery(FRONT_TOKENS.authenticationService, 'getAuthenticatedMember');
  const pathname = usePathname();

  if (error) {
    throw error;
  }

  return (
    <header className="bg-primary py-1 text-inverted">
      <div className="content">
        <div className="row items-center gap-1">
          <a href="/" className="row mr-auto items-center gap-2">
            <img src={logo} alt="Logo" width={64} height={64} />
            <span className="text-lg font-semibold md:text-xl">
              <T>Local trading system</T>
            </span>
          </a>

          {member && <MemberAvatarName member={member} />}
        </div>

        {pathname !== '/' && <Navigation />}
      </div>
    </header>
  );
};
