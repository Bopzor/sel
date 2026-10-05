import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { BottomNav, SideNav } from '@sel/ui';
import { entries } from '@sel/utils';
import { Outlet, ScrollRestoration, useMatch } from 'react-router';

import { useConfig } from 'src/app/config';
import { navigation, routes, type NavigationItem } from 'src/app/routes';
import { useSignOut } from 'src/app/session';
import { Link } from 'src/components/link';
import { PushNotificationsPrompt } from 'src/layout/push-notifications-prompt';

export function Layout() {
  const config = useConfig();
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
      <SideNav.Root
        aria-label={t`Main navigation`}
        className="sticky top-0 hidden h-dvh shrink-0 overflow-y-auto lg:stack"
      >
        <SideNav.Header logo={config.logoUrl} name={config.letsName} place={config.place} />

        {entries(navigation)
          .filter(([group]) => group !== 'account')
          .map(([group, items]) => (
            <SideNav.Section key={group} title={labels[group] && i18n._(labels[group])}>
              {Object.values(items).map((item) => (
                <SideNavLink key={item.path} {...item} />
              ))}
            </SideNav.Section>
          ))}

        <SideNav.Footer>
          <SideNav.Section title={labels.account && i18n._(labels.account)}>
            {Object.values(navigation.account).map((item) => (
              <SideNavLink key={item.path} {...item} />
            ))}

            <SignOutItem />
          </SideNav.Section>
        </SideNav.Footer>
      </SideNav.Root>

      <main className="min-w-0 flex-1 pb-bottom-nav lg:pb-0">
        <div className="mx-auto max-w-page px-3 py-6 sm:px-4 md:px-6 lg:p-10">
          <PushNotificationsPrompt />
          <Outlet />
        </div>
      </main>

      <ScrollRestoration />

      <BottomNav.Root aria-label={t`Main navigation`} fixed className="lg:hidden">
        {bottomNav.map((item) => (
          <BottomNavLink key={item.path} {...item} />
        ))}
      </BottomNav.Root>
    </div>
  );
}

function SignOutItem() {
  const signOut = useSignOut();

  return (
    <SideNav.Item icon="sign-out" onClick={signOut}>
      <Trans>Sign out</Trans>
    </SideNav.Item>
  );
}

function SideNavLink({ path, label, icon }: NavigationItem) {
  const { t } = useLingui();
  const match = useMatch(path === '/' ? path : path + '/*');

  return (
    <SideNav.Item Link={Link} href={path} icon={icon} active={match !== null}>
      {t(label)}
    </SideNav.Item>
  );
}

function BottomNavLink({ path, label, icon }: NavigationItem) {
  const { t } = useLingui();
  const match = useMatch(path === '/' ? path : path + '/*');

  return (
    <BottomNav.Item Link={Link} href={path} icon={icon} active={match !== null}>
      {t(label)}
    </BottomNav.Item>
  );
}
