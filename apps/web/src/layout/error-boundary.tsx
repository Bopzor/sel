import { useQueryClient } from '@tanstack/solid-query';
import { Component, JSX, ErrorBoundary as SolidErrorBoundary } from 'solid-js';

import { Button } from '../components/button';
import { Translate } from '../intl/translate';

const T = Translate.prefix('common.error');

type ErrorBoundaryProps = {
  children: JSX.Element;
};

export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  const queryClient = useQueryClient();

  return (
    <SolidErrorBoundary
      fallback={(error, reset) => (
        <ErrorFallback
          error={error}
          reset={() => {
            void queryClient.invalidateQueries();
            reset();
          }}
        />
      )}
      {...props}
    />
  );
};

type ErrorFallbackProps = {
  error: unknown;
  reset: () => void;
};

const ErrorFallback: Component<ErrorFallbackProps> = (props) => (
  <div class="col mx-auto flex-1 items-center justify-center gap-4 px-4">
    <p class="typo-h1">
      <T id="unknownErrorMessage" />
    </p>

    <div class="max-w-2xl">
      <p class="text-dim">
        <T id="unknownErrorDescription" />
      </p>
      <p>
        {props.error instanceof Error && <T id="errorMessage" values={{ message: props.error.message }} />}
      </p>
    </div>

    <Button onClick={() => props.reset()}>
      <T id="reset" />
    </Button>
  </div>
);
