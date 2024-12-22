import { Navigate } from '@solidjs/router';
import { JSX, Match, Switch } from 'solid-js';

import { queryAuthenticatedMember } from 'src/application/query';
import { routes } from 'src/application/routes';
import { SpinnerFullScreen } from 'src/components/spinner';
import { LogoTitle } from 'src/layout';

export function AuthenticationLayout(props: { children?: JSX.Element }) {
  const memberQuery = queryAuthenticatedMember();

  return (
    <Switch>
      <Match when={memberQuery.isPending}>
        <SpinnerFullScreen />
      </Match>

      <Match when={memberQuery.isSuccess}>
        <Navigate href={routes.home} />
      </Match>

      <Match when={true}>
        <div class="col h-full items-center justify-center px-4">
          <div class="w-full max-w-3xl overflow-hidden rounded-lg bg-neutral shadow-lg">
            <Header />
            <main class="p-4">{props.children}</main>
          </div>
        </div>
      </Match>
    </Switch>
  );
}

function Header() {
  return (
    <header class="bg-primary p-4 text-white">
      <LogoTitle link={routes.authentication} />
    </header>
  );
}
