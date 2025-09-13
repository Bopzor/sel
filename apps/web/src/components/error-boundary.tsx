import { useNavigate } from '@solidjs/router';
import clsx from 'clsx';
import { JSX, Match, onMount, Show, ErrorBoundary as SolidErrorBoundary, Switch } from 'solid-js';

import { ApiError } from 'src/application/api';
import { routes } from 'src/application/routes';
import { createTranslate } from 'src/intl/translate';

import { Button } from './button';

const T = createTranslate('components.errorBoundary');

export function RootErrorBoundary(props: { children: JSX.Element }) {
  return (
    <SolidErrorBoundary
      fallback={(error) => {
        reportError(error);
        return <>{error?.message ?? 'Unknown error'}</>;
      }}
    >
      {props.children}
    </SolidErrorBoundary>
  );
}

type ErrorBoundaryProps = {
  children: JSX.Element;
};

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const navigate = useNavigate();

  return (
    <SolidErrorBoundary
      fallback={(error, reset) => (
        <ErrorFallback
          class="my-32"
          error={error}
          reset={(redirect) => {
            if (redirect !== undefined) {
              navigate(redirect);
            }

            reset();
          }}
        />
      )}
      {...props}
    />
  );
}

type ErrorFallbackProps = {
  error: unknown;
  reset?: (redirect?: string) => void;
  class?: string;
};

export function ErrorFallback(props: ErrorFallbackProps) {
  onMount(() => {
    reportError(props.error);
  });

  return (
    <div class={clsx('mx-auto col items-center justify-center gap-6 px-4', props.class)}>
      <Switch fallback={<UnknownError {...props} />}>
        <Match when={ApiError.isStatus(props.error, 403) ? props.error : false}>
          {(error) => <Forbidden error={error()} />}
        </Match>
        <Match when={ApiError.isStatus(props.error, 404) ? props.error : false}>
          {(error) => <NotFound error={error()} />}
        </Match>
      </Switch>
    </div>
  );
}

function Forbidden(props: { error: ApiError }) {
  return (
    <>
      <h1>
        <T id="forbidden" values={{ nbsp: () => <>&nbsp;</> }} />
      </h1>

      <p class="text-dim">
        <T id="errorMessage" values={{ message: props.error.message }} />
      </p>
    </>
  );
}

export function NotFound(props: { error?: ApiError }) {
  return (
    <>
      <h1>
        <T id="pageNotFound" />
      </h1>

      <Show when={props.error}>
        {(error) => (
          <p class="text-dim">
            <T id="errorMessage" values={{ message: error().message }} />
          </p>
        )}
      </Show>
    </>
  );
}

function UnknownError(props: ErrorFallbackProps) {
  return (
    <>
      <h1>
        <T id="unknownErrorMessage" />
      </h1>

      <div class="col max-w-2xl gap-1">
        <p class="text-dim">
          <T id="unknownErrorDescription" />
        </p>
        <p>
          {props.error instanceof Error && <T id="errorMessage" values={{ message: props.error.message }} />}
        </p>
      </div>

      {props.reset && (
        <div class="row items-center gap-4">
          <Button variant="outline" onClick={() => props.reset?.(routes.home)}>
            <T id="resetToHome" />
          </Button>
          <Button onClick={() => props.reset?.()}>
            <T id="reset" />
          </Button>
        </div>
      )}
    </>
  );
}
