import { JSX, onMount, Show, Suspense } from 'solid-js';

import { Translate } from '../intl/translate';
import { createDebouncedSignal } from '../utils/debounce';

import { Spinner } from './spinner';

export function Loader() {
  const [showLoader, setShowLoader] = createDebouncedSignal(false, 500);

  onMount(() => {
    setShowLoader(true);
  });

  return (
    <Show when={showLoader()}>
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
