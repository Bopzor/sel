import { debounce } from '@solid-primitives/scheduled';
import { createSignal, JSX, onCleanup, onMount } from 'solid-js';

export function Spinner(props: JSX.SVGElementTags['svg']) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width={3} opacity={0.25} />

      <path
        d="M 2 10 C 2 5.6 5.6 2 10 2"
        stroke="currentColor"
        stroke-width={3}
        stroke-linecap="round"
        class="origin-center animate-spin"
      />
    </svg>
  );
}

export function SpinnerFullScreen() {
  const [show, setShow] = createSignal(false);
  const setShowDebounce = debounce(() => setShow(true), 250);

  onMount(setShowDebounce);
  onCleanup(setShowDebounce.clear);

  return (
    <div class="fixed inset-0 col items-center justify-center bg-neutral">
      {show() && <Spinner class="size-10" />}
    </div>
  );
}
