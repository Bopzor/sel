import { entries, keys } from '@sel/utils';
import { Navigate } from '@solidjs/router';
import { useMutation } from '@tanstack/solid-query';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { arrowRight, bars_3, calendar, handRaised, home, sparkles, star, users } from 'solid-heroicons/solid';
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
  For,
} from 'solid-js';
import { Portal } from 'solid-js/web';

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
          <LogoTitle link={routes.home} onClick={closeDrawer} class="p-4 shadow-lg" />

          <div class="scrollbar flex-1 overflow-y-auto">
            <section class="mt-6 col gap-2">
              <h2 class="bg-white/10 px-4 py-1 text-xl font-semibold">
                <T id="drawer.navigation.title" />
              </h2>
              <DrawerNavigation closeDrawer={closeDrawer} />
            </section>

            <section class="mt-6 col gap-2">
              <h2 class="bg-white/10 px-4 py-1 text-xl font-semibold">
                <T id="drawer.quickAccess.title" />
              </h2>
              <QuickAccess closeDrawer={closeDrawer} />
            </section>
          </div>

          <MemberProfile
            class="mt-auto row items-center gap-4 border-t-2 border-white/10 p-4"
            onClick={closeDrawer}
          />
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
        <button class="px-4 sm:hidden" onClick={() => props.openDrawer()}>
          <Icon path={bars_3} class="size-10" />
        </button>

        <LogoTitle link={routes.home} class="flex w-fit sm:mx-0 lg:order-1" />

        <MemberProfile class="hidden items-center gap-1 sm:col lg:order-3" />

        <nav class="col-span-2 hidden flex-1 justify-center whitespace-nowrap sm:row lg:order-2 lg:col-span-1 xl:px-8">
          <NavigationItem href={routes.home} end>
            <T id="drawer.navigation.items.home.label" />
          </NavigationItem>
          <NavigationItem href={routes.members.list}>
            <T id="drawer.navigation.items.members.label" />
          </NavigationItem>
          <NavigationItem href={routes.requests.list}>
            <T id="drawer.navigation.items.requests.label" />
          </NavigationItem>
          <NavigationItem href={routes.events.list}>
            <T id="drawer.navigation.items.events.label" />
          </NavigationItem>
          <NavigationItem href={routes.interests}>
            <T id="drawer.navigation.items.interests.label" />
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
      activeClass="text-amber-400"
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
  const links = {
    home: routes.home,
    members: routes.members.list,
    requests: routes.requests.list,
    events: routes.events.list,
    interests: routes.interests,
    misc: routes.misc,
  };

  const icons = {
    home: home,
    members: users,
    requests: handRaised,
    events: calendar,
    interests: sparkles,
    misc: star,
  };

  return (
    <nav class="col gap-2 px-4">
      <For each={keys(links)}>
        {(item) => (
          <Link
            href={links[item]}
            onClick={props.closeDrawer}
            class="row items-center gap-4"
            activeClass="active group text-amber-400"
            end={item === 'home'}
          >
            <div>
              <Icon path={icons[item]} class="size-6" />
            </div>

            <div>
              <div class="text-lg leading-6 font-medium">
                <T id={`drawer.navigation.items.${item}.label`} />
              </div>
              <div class="text-sm text-white/80 group-[.active]:text-amber-400">
                <T id={`drawer.navigation.items.${item}.description`} />
              </div>
            </div>
          </Link>
        )}
      </For>
    </nav>
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
        <div
          ref={ref}
          class="fixed inset-y-0 col w-full max-w-80 bg-primary text-white animate-in slide-in-from-left-24"
        >
          {props.children}
        </div>
      </Backdrop>
    </Portal>
  );
}

function QuickAccess(props: { closeDrawer: () => void }) {
  const links = {
    createTransaction: '/?create=transaction',
    createInformation: '/?create=information',
    createRequest: routes.requests.create,
    createEvent: routes.events.create,
    editProfile: routes.profile.edition,
    search: '/',
    help: routes.misc,
  };

  return (
    <ul class="col gap-1.5 px-4">
      <For each={entries(links)}>
        {([item, link]) => (
          <li>
            <Link href={link} class="row items-center gap-2" onClick={props.closeDrawer}>
              <Icon path={arrowRight} class="size-4" />
              <T id={`drawer.quickAccess.items.${item}`} />
            </Link>
          </li>
        )}
      </For>
    </ul>
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

  const mutation = useMutation(() => ({
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
