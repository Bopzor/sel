import { debounce } from '@solid-primitives/scheduled';
import { createEffect, createSignal } from 'solid-js';

export function createDebouncedSignal<T>(initialValue: T, wait: number) {
  const [getter, setter] = createSignal(initialValue);
  const debouncedSetter = debounce(setter, wait);

  return [getter, debouncedSetter] as const;
}

export function createDebouncedValue<T>(getter: () => T, wait: number) {
  const [debounced, setDebounced] = createDebouncedSignal(getter(), wait);

  createEffect(() => {
    const value = getter();
    setDebounced(() => value);
  });

  return debounced;
}
