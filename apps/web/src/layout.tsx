import { Navigate } from '@solidjs/router';
import { createMutation } from '@tanstack/solid-query';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { bars_3, calendar, handRaised, home, sparkles, star, users } from 'solid-heroicons/solid';
import {
  ComponentProps,
  createEffect,
  createResource,
  createSignal,
  JSX,
  Match,
  onMount,
  Show,
  Switch,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { Motion } from 'solid-motionone';

import { routes } from 'src/application/routes';
import { Backdrop } from 'src/components/dialog';

import { ApiError } from './application/api';
import { notify } from './application/notify';
import { getAuthenticatedMember, queryAuthenticatedMember } from './application/query';
import { ErrorBoundary } from './components/error-boundary';
import { link, Link } from './components/link';
import { MemberAvatar } from './components/member-avatar-name';
import { TextSkeleton } from './components/skeleton';
import { SpinnerFullScreen } from './components/spinner';
import { createTranslate } from './intl/translate';
import Logo from './logo.svg';
import { detectDevice } from './utils/detect-device';
import { getRegistrationState, registerDevice } from './utils/device-registration';
import { createDismiss } from './utils/event-handlers';
import { createMediaQuery } from './utils/media-query';

const T = createTranslate('layout');

export function Layout(props: { children?: JSX.Element }) {
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const closeDrawer = () => setDrawerOpen(false);

  const prefersDark = createMediaQuery('(prefers-color-scheme: dark)');

  onMount(() => {
    if (localStorage.getItem('dark') === null) {
      localStorage.setItem('dark', String(prefersDark()));
    }

    if (localStorage.getItem('dark') === 'true') {
      document.documentElement.classList.add('dark');
    }
  });

  const memberQuery = queryAuthenticatedMember();

  return (
    <Switch>
      <Match when={memberQuery.isPending}>
        <SpinnerFullScreen />
      </Match>

      <Match when={memberQuery.isError && ApiError.isStatus(memberQuery.error, 401)}>
        <Navigate href={routes.authentication} />
      </Match>

      <Match when={memberQuery.data?.onboardingCompleted === false}>
        <Navigate href={routes.onboarding} />
      </Match>

      <Match when={memberQuery.isSuccess}>
        <CheckDeviceRegistration />

        <Header openDrawer={() => setDrawerOpen(true)} />

        <Drawer open={drawerOpen()} onClose={closeDrawer}>
          <LogoTitle link={routes.home} onClick={closeDrawer} />
          <DrawerNavigation closeDrawer={closeDrawer} />
          <MemberProfile class="row items-center gap-4 py-4 sm:hidden" onClick={closeDrawer} />
        </Drawer>

        <main class="mx-auto mt-20 max-w-7xl px-4 py-6 sm:mt-0">
          <ErrorBoundary>{props.children}</ErrorBoundary>
        </main>
      </Match>
    </Switch>
  );
}

function MemberProfile(props: { onClick?: () => void; class?: string }) {
  const authenticatedMember = getAuthenticatedMember();

  return (
    <Link href={routes.profile.edition} {...props}>
      <MemberAvatar member={authenticatedMember()} class="size-10 rounded-full" />
      <Show when={authenticatedMember()} fallback={<TextSkeleton width={4} />}>
        {(member) => <span>{member()?.firstName}</span>}
      </Show>
    </Link>
  );
}

function Header(props: { openDrawer: () => void }) {
  return (
    <header class="fixed inset-x-0 top-0 z-10 h-20 bg-primary text-white shadow-md sm:static sm:h-auto">
      <div class="mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center py-4 sm:grid-cols-1 sm:px-4 sm:py-2 lg:grid-cols-[auto_1fr_auto]">
        <button class="px-2 sm:hidden" onClick={() => props.openDrawer()}>
          <Icon path={bars_3} class="size-10" />
        </button>

        <LogoTitle link={routes.home} class="mx-auto hidden w-fit sm:mx-0 sm:flex lg:order-1" />

        <MemberProfile class="hidden items-center gap-1 sm:col lg:order-3" />

        <nav class="col-span-2 hidden flex-1 justify-center whitespace-nowrap sm:row lg:order-2 lg:col-span-1 xl:px-8">
          <NavigationItem href={routes.home} end>
            <T id="navigation.home.label" />
          </NavigationItem>
          <NavigationItem href={routes.members.list}>
            <T id="navigation.members.label" />
          </NavigationItem>
          <NavigationItem href={routes.requests.list}>
            <T id="navigation.requests.label" />
          </NavigationItem>
          <NavigationItem href={routes.events.list}>
            <T id="navigation.events.label" />
          </NavigationItem>
          <NavigationItem href={routes.interests}>
            <T id="navigation.interests.label" />
          </NavigationItem>
        </nav>
      </div>
    </header>
  );
}

function NavigationItem(props: ComponentProps<typeof Link>) {
  return (
    <Link
      class="rounded-md px-4 py-2 font-semibold transition-colors hover:bg-neutral/10"
      activeClass="text-yellow-400"
      {...props}
    />
  );
}

export function LogoTitle(props: { link: string; onClick?: () => void; class?: string }) {
  return (
    <Link
      href={props.link}
      class={clsx('row items-center gap-2 xl:gap-4', props.class)}
      onClick={() => props.onClick?.()}
    >
      <div>
        <Logo class="size-12 rounded-sm xl:size-16" />
      </div>

      <div class="leading-none">
        <div class="text-lg font-semibold xl:text-2xl">
          <T id="title.title" />
        </div>
        <div class="text-sm text-white/80">
          <T id="title.subtitle" />
        </div>
      </div>
    </Link>
  );
}

function DrawerNavigation(props: { closeDrawer: () => void }) {
  return (
    <nav class="col divide-y divide-white/20">
      <DrawerNavigationItem
        href={routes.home}
        icon={home}
        label={<T id="navigation.home.label" />}
        description={<T id="navigation.home.description" />}
        onClick={props.closeDrawer}
      />

      <DrawerNavigationItem
        href={routes.members.list}
        icon={users}
        label={<T id="navigation.members.label" />}
        description={<T id="navigation.members.description" />}
        onClick={props.closeDrawer}
      />

      <DrawerNavigationItem
        href={routes.requests.list}
        icon={handRaised}
        label={<T id="navigation.requests.label" />}
        description={<T id="navigation.requests.description" />}
        onClick={props.closeDrawer}
      />

      <DrawerNavigationItem
        href={routes.events.list}
        icon={calendar}
        label={<T id="navigation.events.label" />}
        description={<T id="navigation.events.description" />}
        onClick={props.closeDrawer}
      />

      <DrawerNavigationItem
        href={routes.interests}
        icon={sparkles}
        label={<T id="navigation.interests.label" />}
        description={<T id="navigation.interests.description" />}
        onClick={props.closeDrawer}
      />

      <DrawerNavigationItem
        href={routes.misc}
        icon={star}
        label={<T id="navigation.misc.label" />}
        description={<T id="navigation.misc.description" />}
        onClick={props.closeDrawer}
      />
    </nav>
  );
}

function DrawerNavigationItem(props: {
  href: string;
  icon: ComponentProps<typeof Icon>['path'];
  label: JSX.Element;
  description: JSX.Element;
  onClick: () => void;
}) {
  return (
    <Link
      href={props.href}
      onClick={props.onClick}
      class="row items-center gap-4 py-4"
      activeClass="text-yellow-400"
      end={props.href === routes.home}
    >
      <div>
        <Icon path={props.icon} class="size-6" />
      </div>
      <div>
        <div class="text-lg">{props.label}</div>
        <div class="text-sm">{props.description}</div>
      </div>
    </Link>
  );
}

function Drawer(props: { open: boolean; onClose: () => void; children: JSX.Element }) {
  let ref!: HTMLDivElement;

  createDismiss(
    () => ref,
    () => props.open,
    () => props.onClose(),
  );

  return (
    <Portal>
      <Backdrop show={props.open}>
        <Motion.div
          ref={ref}
          initial={{ opacity: 0, x: -140 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -140 }}
          transition={{ duration: 0.2, easing: 'ease-in-out' }}
          class="fixed inset-y-0 col w-full max-w-80 justify-between gap-4 overflow-y-auto bg-primary p-4 text-white"
        >
          {props.children}
        </Motion.div>
      </Backdrop>
    </Portal>
  );
}

function CheckDeviceRegistration() {
  const t = T.useTranslate();

  const [registrationState] = createResource(() => getRegistrationState());
  const authenticatedMember = getAuthenticatedMember();

  createEffect(() => {
    const showIf = [
      authenticatedMember()?.notificationDelivery.push,
      detectDevice() === 'mobile',
      registrationState() === 'prompt',
      localStorage.getItem('asked-device-registration') !== 'true',
    ];

    if (showIf.every(Boolean)) {
      const message = t('registerDevice', {
        link: link(routes.profile.settings, { class: 'text-link' }),
      });

      notify.info(<p>{message}</p>);
      localStorage.setItem('asked-device-registration', 'true');
    }
  });

  const mutation = createMutation(() => ({
    async mutationFn() {
      if ((await getRegistrationState()) === 'granted') {
        await registerDevice(detectDevice());
      }
    },
  }));

  onMount(() => {
    mutation.mutate();
  });

  return null;
}
