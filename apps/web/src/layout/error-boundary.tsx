import { JSX, Show, ErrorBoundary as SolidErrorBoundary, createEffect } from 'solid-js';

import { Button } from '../components/button';
import { ApiError } from '../infrastructure/api';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { TOKENS } from '../tokens';

const T = Translate.prefix('common.error');

type ErrorBoundaryProps = {
  children: JSX.Element;
};

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const router = container.resolve(TOKENS.router);

  return (
    <SolidErrorBoundary
      fallback={(error, reset) => (
        <ErrorFallback
          error={error}
          reset={(redirect) => {
            if (redirect !== undefined) {
              router.navigate(redirect);
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
  reset: (redirect?: string) => void;
};

function ErrorFallback(props: ErrorFallbackProps) {
  createEffect(() => {
    // todo: report
    // eslint-disable-next-line no-console
    console.error(props.error);
  });

  return (
    <div class="col mx-auto flex-1 items-center justify-center gap-4 px-4">
      <Show
        when={ApiError.isStatus(props.error, 404) ? props.error : false}
        fallback={<UnknownError {...props} />}
      >
        {(error) => (
          <>
            <p class="typo-h1">
              <T id="pageNotFound" />
            </p>
            <p class="text-dim">
              <T id="errorMessage" values={{ message: error().message }} />
            </p>
          </>
        )}
      </Show>
    </div>
  );
}

function UnknownError(props: ErrorFallbackProps) {
  return (
    <>
      <p class="typo-h1">
        <T id="unknownErrorMessage" values={{ nbsp: () => <>&nbsp;</> }} />
      </p>

      <div class="col max-w-2xl gap-1">
        <p class="text-dim">
          <T id="unknownErrorDescription" />
        </p>
        <p>
          {props.error instanceof Error && <T id="errorMessage" values={{ message: props.error.message }} />}
        </p>
      </div>

      <div class="row items-center gap-4">
        <Button variant="secondary" onClick={() => props.reset(routes.home)}>
          <T id="resetToHome" />
        </Button>
        <Button onClick={() => props.reset()}>
          <T id="reset" />
        </Button>
      </div>
    </>
  );
}
