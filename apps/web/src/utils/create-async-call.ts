import { debounce } from '@solid-primitives/scheduled';
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
  options: { debounce?: number } = {},
) => {
  const errorHandler = createErrorHandler();
  const [pending, setPending] = createSignal(false);

  const trigger = (...args: Args) => {
    void fn(...args)
      .then(onSuccess, onError ?? errorHandler)
      .finally(() => setPending(false))
      .then(onSettled);
  };

  const debouncedTrigger = debounce(trigger, options.debounce);

  return [
    (...args: Args) => {
      setPending(true);
      debouncedTrigger(...args);
    },
    pending,
  ] satisfies [unknown, unknown];
};
