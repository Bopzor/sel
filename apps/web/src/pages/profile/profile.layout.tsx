import { Icon } from 'solid-heroicons';
import { arrowRightOnRectangle, arrowsRightLeft, cog_6Tooth, mapPin, user } from 'solid-heroicons/solid';
import { ComponentProps, JSX } from 'solid-js';

import { routes } from 'src/application/routes';
import { breadcrumb, Breadcrumb } from 'src/components/breadcrumb';
import { Link } from 'src/components/link';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.profile.navigation');

export function ProfileLayout(props: { children?: JSX.Element }) {
  return (
    <>
      <Breadcrumb items={[breadcrumb.profile()]} />

      <div class="col md:row grow gap-4 lg:gap-8">
        <div class="w-full sm:max-w-64">
          <Navigation />
        </div>

        <div class="col min-w-0 flex-1 grow gap-4">{props.children}</div>
      </div>
    </>
  );
}

function Navigation() {
  return (
    <nav class="col gap-2">
      <NavigationLink href={routes.profile.edition} icon={user}>
        <T id="profile" />
      </NavigationLink>

      <NavigationLink href={routes.profile.address} icon={mapPin}>
        <T id="address" />
      </NavigationLink>

      <NavigationLink href={routes.profile.transactions} icon={arrowsRightLeft}>
        <T id="transactions" />
      </NavigationLink>

      <NavigationLink href={routes.profile.settings} icon={cog_6Tooth}>
        <T id="settings" />
      </NavigationLink>

      <NavigationLink href={routes.profile.signOut} icon={arrowRightOnRectangle}>
        <T id="signOut" />
      </NavigationLink>
    </nav>
  );
}

type NavigationLinkProps = {
  href: string;
  icon: ComponentProps<typeof Icon>['path'];
  children: JSX.Element;
};

function NavigationLink(props: NavigationLinkProps) {
  return (
    <Link
      href={props.href}
      class="row items-center gap-2 rounded-sm border-l-4 border-transparent p-2 font-medium transition-colors"
      inactiveClass="hover:bg-primary/5 dark:hover:bg-primary/10"
      activeClass="border-primary! bg-primary/10 dark:bg-primary/20"
      end
    >
      <Icon path={props.icon} class="size-5 fill-primary/75 dark:fill-primary" />
      {props.children}
    </Link>
  );
}
