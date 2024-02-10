import { JSX, Show, lazy } from 'solid-js';

import { authenticatedMember, unreadNotificationsCount } from '../app-context';
import { Link } from '../components/link';
import { MemberAvatar } from '../components/member-avatar';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { TOKENS } from '../tokens';

import { ErrorBoundary } from './error-boundary';
import { Header } from './header';

const AuthenticationPage = lazy(() => import('../modules/authentication/authentication.page'));

type LayoutProps = {
  children: JSX.Element;
};

export function Layout(props: LayoutProps) {
  const router = container.resolve(TOKENS.router);
  const pathname = () => router.location.pathname;

  return (
    <Show when={authenticatedMember()} fallback={<AuthenticationPage />}>
      <Header>
        <HeaderMember />
      </Header>

      <ErrorBoundary>
        <Show when={authenticatedMember()?.onboardingCompleted || pathname() === '/onboarding'}>
          <main class="col mx-auto w-full max-w-7xl flex-1 px-4 pb-4">{props.children}</main>
        </Show>
      </ErrorBoundary>
    </Show>
  );
}

export const HeaderMember = () => {
  return (
    <Link unstyled href={routes.profile.profileEdition} class="col relative items-center gap-1 font-semibold">
      <MemberAvatar member={authenticatedMember()} class="relative size-10 rounded-full" />
      <UnreadNotificationsCount />
      <div class="leading-1">{authenticatedMember()?.firstName}</div>
    </Link>
  );
};

function UnreadNotificationsCount() {
  return (
    <span
      class="row absolute -right-1 -top-1 size-5 scale-0 items-center justify-center rounded-full bg-yellow-600 text-sm transition-transform"
      classList={{ 'scale-100': unreadNotificationsCount() > 0 }}
    >
      <Show
        when={unreadNotificationsCount() < 10}
        fallback={<Translate id="layout.header.notificationsCountGreaterThan9" />}
      >
        {unreadNotificationsCount()}
      </Show>
    </span>
  );
}
