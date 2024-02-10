import { createSignal } from 'solid-js';

import { createErrorHandler } from './create-error-handler';

type AsyncCallEffects<Result> = {
  onSuccess?: (result: Result) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
};

export const createAsyncCall = <Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  { onSuccess, onError, onSettled }: AsyncCallEffects<Result> = {},
) => {
  const errorHandler = createErrorHandler();
  const [pending, setPending] = createSignal(false);

  const trigger = (...args: Args) => {
    setPending(true);

    void fn(...args)
      .then(onSuccess, onError ?? errorHandler)
      .finally(() => setPending(false))
      .then(onSettled);
  };

  return [trigger, pending] satisfies [unknown, unknown];
};
