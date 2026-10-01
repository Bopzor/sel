import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  BottomNav,
  BottomNavItem,
  SideNav,
  SideNavFooter,
  SideNavHeader,
  SideNavItem,
  SideNavSection,
} from '@sel/ui';
import { entries } from '@sel/utils';
import { Outlet, useMatch } from 'react-router';

import { Link } from '../components/link';
import { instance } from '../instance';
import { navigation, routes, type NavigationItem } from '../routes';
import { useSignOut } from '../session';

export function Layout() {
  const { t, i18n } = useLingui();

  const labels: Partial<{ [Group in keyof typeof navigation]: MessageDescriptor }> = {
    exchanges: msg`Exchanges`,
    community: msg`Community`,
    account: msg`My account`,
  };

  const bottomNav: NavigationItem[] = [
    navigation.main.home,
    navigation.exchanges.requests,
    navigation.exchanges.events,
    { path: routes.navigation(), label: msg`More`, icon: 'menu' },
  ];

  return (
    <div className="row min-h-dvh">
      <SideNav
        aria-label={t`Main navigation`}
        className="sticky top-0 hidden h-dvh shrink-0 overflow-y-auto lg:stack"
      >
        <SideNavHeader logo={instance.logo} name={instance.name} place={instance.place} />

        {entries(navigation)
          .filter(([group]) => group !== 'account')
          .map(([group, items]) => (
            <SideNavSection key={group} title={labels[group] && i18n._(labels[group])}>
              {Object.values(items).map((item) => (
                <SideNavLink key={item.path} {...item} />
              ))}
            </SideNavSection>
          ))}

        <SideNavFooter>
          <SideNavSection title={labels.account && i18n._(labels.account)}>
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

      <BottomNav aria-label={t`Main navigation`} fixed className="lg:hidden">
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
      <Trans>Sign out</Trans>
    </SideNavItem>
  );
}

function SideNavLink({ path, label, icon }: NavigationItem) {
  const { t } = useLingui();
  const match = useMatch(path);

  return (
    <SideNavItem Link={Link} href={path} icon={icon} active={match !== null}>
      {t(label)}
    </SideNavItem>
  );
}

function BottomNavLink({ path, label, icon }: NavigationItem) {
  const { t } = useLingui();
  const match = useMatch(path);

  return (
    <BottomNavItem Link={Link} href={path} icon={icon} active={match !== null}>
      {t(label)}
    </BottomNavItem>
  );
}
