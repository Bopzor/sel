import {
  BottomNav,
  BottomNavItem,
  SideNav,
  SideNavFooter,
  SideNavHeader,
  SideNavItem,
  SideNavSection,
  type IconName,
} from '@sel/ui';
import { entries } from '@sel/utils';
import { Outlet, useMatch } from 'react-router';

import { Link } from '../components/link';
import { instance } from '../instance';
import { navigation, routes } from '../routes';
import { useSignOut } from '../session';
import { t } from '../translations';

type Navigation = typeof navigation;

export function Layout() {
  const labels: Partial<{ [Group in keyof Navigation]: string }> = t.navigation.groups;

  const bottomNav: Array<{ path: string; label: string; icon: IconName }> = [
    navigation.main.home,
    navigation.exchanges.requests,
    navigation.exchanges.events,
    { path: routes.navigation(), label: t.navigation.more, icon: 'menu' },
  ];

  return (
    <div className="row min-h-dvh">
      <SideNav
        aria-label={t.navigation.label}
        className="sticky top-0 hidden h-dvh shrink-0 overflow-y-auto lg:stack"
      >
        <SideNavHeader logo={instance.logo} name={instance.name} place={instance.place} />

        {entries(navigation)
          .filter(([group]) => group !== 'account')
          .map(([group, items]) => (
            <SideNavSection key={group} title={labels[group]}>
              {Object.values(items).map((item) => (
                <SideNavLink key={item.path} {...item} />
              ))}
            </SideNavSection>
          ))}

        <SideNavFooter>
          <SideNavSection title={labels.account}>
            {Object.values(navigation.account).map((item) => (
              <SideNavLink key={item.path} {...item} />
            ))}

            <SignOutItem />
          </SideNavSection>
        </SideNavFooter>
      </SideNav>

      <main className="min-w-0 flex-1 pb-bottom-nav lg:pb-0">
        <div className="mx-auto max-w-page px-4 py-6 md:px-6 lg:p-10">
          <Outlet />
        </div>
      </main>

      <BottomNav aria-label={t.navigation.label} fixed className="lg:hidden">
        {bottomNav.map((item) => (
          <BottomNavLink key={item.path} {...item} />
        ))}
      </BottomNav>
    </div>
  );
}

function SignOutItem() {
  const signOut = useSignOut();

  return (
    <SideNavItem icon="sign-out" onClick={signOut}>
      {t.signOut}
    </SideNavItem>
  );
}

function SideNavLink({ path, label, icon }: { path: string; label: string; icon: IconName }) {
  const match = useMatch(path);

  return (
    <SideNavItem Link={Link} href={path} icon={icon} active={match !== null}>
      {label}
    </SideNavItem>
  );
}

function BottomNavLink({ path, label, icon }: { path: string; label: string; icon: IconName }) {
  const match = useMatch(path);

  return (
    <BottomNavItem Link={Link} href={path} icon={icon} active={match !== null}>
      {label}
    </BottomNavItem>
  );
}
