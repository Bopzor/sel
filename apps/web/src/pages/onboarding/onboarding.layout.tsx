import { Navigate, useNavigate } from '@solidjs/router';
import { createMutation } from '@tanstack/solid-query';
import { JSX, Match, Switch } from 'solid-js';

import { api } from 'src/application/api';
import { queryAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Button } from 'src/components/button';
import { ErrorBoundary } from 'src/components/error-boundary';
import { SpinnerFullScreen } from 'src/components/spinner';
import { createTranslate } from 'src/intl/translate';
import { LogoTitle } from 'src/layout';

const T = createTranslate('pages.onboarding');

export function OnboardingLayout(props: { children?: JSX.Element }) {
  const memberQuery = queryAuthenticatedMember();

  return (
    <Switch>
      <Match when={memberQuery.isPending}>
        <SpinnerFullScreen />
      </Match>

      <Match when={memberQuery.data?.onboardingCompleted === true}>
        <Navigate href={routes.home} />
      </Match>

      <Match when={true}>
        <Header />

        <div class="flex-1 overflow-x-auto overflow-y-scroll sm:overflow-visible">
          <ErrorBoundary>
            <main class="mx-auto max-w-3xl px-4 py-24">{props.children}</main>
          </ErrorBoundary>
        </div>
      </Match>
    </Switch>
  );
}

function Header() {
  const invalidate = useInvalidateApi();
  const navigate = useNavigate();

  const mutation = createMutation(() => ({
    async mutationFn() {
      await api.signOut({});
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
      navigate(routes.home);
    },
  }));

  return (
    <header class="bg-primary text-white shadow-md">
      <div class="mx-auto row grid max-w-7xl flex-wrap items-center justify-between gap-4 p-4 sm:grid-cols-1 sm:px-4 sm:py-2">
        <LogoTitle link={routes.authentication} />

        <Button
          variant="ghost"
          class="rounded-md text-inherit hover:bg-neutral/10"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <T id="signOut" />
        </Button>
      </div>
    </header>
  );
}
