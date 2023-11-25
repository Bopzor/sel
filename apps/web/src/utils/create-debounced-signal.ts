import { debounce } from '@solid-primitives/scheduled';
import { createSignal } from 'solid-js';

export function createDebouncedSignal<T>(initialValue: T, wait: number) {
  const [getter, setter] = createSignal(initialValue);
  const debouncedSetter = debounce(setter, wait);

  return [getter, debouncedSetter] as const;
}
