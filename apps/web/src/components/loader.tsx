import { onMount, Show } from 'solid-js';

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
        <Spinner class="h-12 w-12" />
        <p class="typo-h1">
          <Translate id="common.loading" />
        </p>
      </div>
    </Show>
  );
}
