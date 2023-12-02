import { createSignal } from 'solid-js';

export const createAsyncCall = <Args extends unknown[]>(fn: (...args: Args) => Promise<unknown>) => {
  const [pending, setPending] = createSignal(false);

  const trigger = (...args: Args) => {
    setPending(true);
    void fn(...args).finally(() => setPending(false));
  };

  return [trigger, pending] satisfies [unknown, unknown];
};
