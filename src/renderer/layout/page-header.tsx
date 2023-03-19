import { LinkButton } from '../../app/components/button';
import { FRONT_TOKENS } from '../../app/front-tokens';
import { useQuery } from '../../app/hooks/use-query';
import { Translation } from '../../app/i18n.context';
import { MemberAvatarName } from '../../modules/members/components/member-avatar-name';
import { usePathname } from '../page-context';

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

const Navigation = () => (
  <nav className="mt-1 grid grid-cols-2 gap-1 text-neutral md:ml-auto md:max-w-[48rem] md:grid-cols-4">
    <LinkButton href="/demandes" className="!inline-block !bg-requests text-center !text-inherit">
      <T>Requests</T>
    </LinkButton>

    <LinkButton href="#" className="!inline-block !bg-events text-center !text-inherit">
      <T>Events</T>
    </LinkButton>

    <LinkButton href="/membres" className="!inline-block !bg-members text-center !text-inherit">
      <T>Members</T>
    </LinkButton>

    <LinkButton href="#" className="!inline-block !bg-tools text-center !text-inherit">
      <T>Tools</T>
    </LinkButton>
  </nav>
);
