import { Icon } from 'solid-heroicons';
import { arrowRightOnRectangle, bell, cog_6Tooth, mapPin, user } from 'solid-heroicons/solid';
import { Component, ComponentProps, JSX } from 'solid-js';

import { BackLink } from '../components/back-link';
import { Link } from '../components/link';
import { Translate } from '../intl/translate';
import { routes } from '../routes';

const T = Translate.prefix('profile.navigation');

type ProfileLayoutProps = {
  children?: JSX.Element;
};

export const ProfileLayout: Component<ProfileLayoutProps> = (props) => {
  return (
    <div>
      <BackLink href={routes.home} />

      <div class="col md:row gap-4 lg:gap-8">
        <div class="w-full sm:max-w-[14rem] lg:max-w-xs">
          <Navigation />
        </div>

        <div class="col flex-1 gap-4">{props.children}</div>
      </div>
    </div>
  );
};

const Navigation: Component = () => (
  <div role="navigation" class="col gap-2">
    <NavigationLink href={routes.profile.profileEdition} icon={user}>
      <T id="profile" />
    </NavigationLink>

    <NavigationLink href={routes.profile.address} icon={mapPin}>
      <T id="address" />
    </NavigationLink>

    <NavigationLink href={routes.profile.notifications} icon={bell}>
      <T id="notifications" />
    </NavigationLink>

    <NavigationLink href={routes.profile.settings} icon={cog_6Tooth}>
      <T id="settings" />
    </NavigationLink>

    <NavigationLink href={routes.profile.signOut} icon={arrowRightOnRectangle}>
      <T id="signOut" />
    </NavigationLink>
  </div>
);

type NavigationLinkProps = {
  href: string;
  icon: ComponentProps<typeof Icon>['path'];
  children: JSX.Element;
};

const NavigationLink: Component<NavigationLinkProps> = (props) => (
  <Link
    end
    href={props.href}
    unstyled
    class="row items-center gap-2 rounded border-l-4 border-transparent p-2 font-medium transition-colors"
    inactiveClass="hover:bg-primary/5 dark:hover:bg-primary/10"
    activeClass="!border-primary bg-primary/10 dark:bg-primary/20"
  >
    <Icon path={props.icon} class="h-5 w-5 fill-primary/75 dark:fill-primary" />
    {props.children}
  </Link>
);
