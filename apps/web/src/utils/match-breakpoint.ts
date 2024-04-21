import { createSignal, onMount, onCleanup } from 'solid-js';

export function matchBreakpoint(minWidth: number) {
  const [isMobile, setIsMobile] = createSignal(window.matchMedia(`(min-width: ${minWidth}px)`).matches);

  function listener() {
    setIsMobile(window.matchMedia(`(min-width: ${minWidth}px)`).matches);
  }

  onMount(() => window.addEventListener('resize', listener));
  onCleanup(() => window.removeEventListener('resize', listener));

  return isMobile;
}
