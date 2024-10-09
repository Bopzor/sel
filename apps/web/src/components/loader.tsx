import { debounce } from '@solid-primitives/scheduled';
import { createSignal, JSX, onCleanup, onMount, Show, Suspense } from 'solid-js';

import { Translate } from '../intl/translate';

import { Spinner } from './spinner';

export function Loader() {
  const [show, setShow] = createSignal(false);
  const setShowDebounced = debounce(setShow, 200);

  onMount(() => {
    setShowDebounced(true);
    onCleanup(() => setShowDebounced.clear());
  });

  return (
    <Show when={show()}>
      <div class="row mx-auto flex-1 items-center gap-4">
        <Spinner class="size-12" />
        <p class="typo-h1">
          <Translate id="common.loading" />
        </p>
      </div>
    </Show>
  );
}

export function SuspenseLoader(props: { children: JSX.Element }) {
  return <Suspense fallback={<Loader />}>{props.children}</Suspense>;
}
