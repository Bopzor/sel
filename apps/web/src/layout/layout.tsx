import { createMutation } from '@tanstack/solid-query';
import { JSX, Show, createEffect, createResource, lazy } from 'solid-js';

import { Link } from '../components/link';
import { MemberAvatar } from '../components/member-avatar';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { TOKENS } from '../tokens';
import { getAuthenticatedMember } from '../utils/authenticated-member';
import { detectDevice } from '../utils/detect-device';
import { notify } from '../utils/notify';

import { ErrorBoundary } from './error-boundary';
import { Header } from './header';

const AuthenticationPage = lazy(() => import('../modules/authentication/authentication.page'));

type LayoutProps = {
  children: JSX.Element;
};

export function Layout(props: LayoutProps) {
  const router = container.resolve(TOKENS.router);
  const authenticatedMember = getAuthenticatedMember();
  const pathname = () => router.location.pathname;

  return (
    <Show when={authenticatedMember()} fallback={<AuthenticationPage />}>
      <Header>
        <HeaderMember />
      </Header>

      <ErrorBoundary>
        <Show when={authenticatedMember()?.onboardingCompleted || pathname() === '/onboarding'}>
          <main class="col mx-auto w-full max-w-7xl flex-1 px-4 pb-4">{props.children}</main>
          <CheckDeviceRegistration />
        </Show>
      </ErrorBoundary>
    </Show>
  );
}

function HeaderMember() {
  const authenticatedMember = getAuthenticatedMember();

  return (
    <Link unstyled href={routes.profile.profileEdition} class="col relative items-center gap-1 font-semibold">
      <MemberAvatar member={authenticatedMember()} class="relative size-10 rounded-full" />
      <div class="leading-1">{authenticatedMember()?.firstName}</div>
    </Link>
  );
}

function CheckDeviceRegistration() {
  const pushSubscription = container.resolve(TOKENS.pushSubscription);
  const [registrationState] = createResource(() => pushSubscription.getRegistrationState());
  const authenticatedMember = getAuthenticatedMember();

  createEffect(() => {
    if (!authenticatedMember()?.notificationDelivery.push) {
      return;
    }

    if (detectDevice() !== 'mobile') {
      return;
    }

    if (registrationState() !== 'prompt') {
      return;
    }

    if (localStorage.getItem('asked-device-registration') === 'true') {
      return;
    }

    localStorage.setItem('asked-device-registration', 'true');

    notify.info(
      <Translate
        id="layout.registerDevice"
        values={{ link: (children) => <Link href={routes.profile.settings}>{children}</Link> }}
      />,
    );
  });

  const registerDevice = createMutation(() => ({
    async mutationFn() {
      if ((await pushSubscription.getRegistrationState()) === 'granted') {
        await pushSubscription.registerDevice();
      }
    },
  }));

  createEffect(() => {
    registerDevice.mutate();
  });

  return null;
}
