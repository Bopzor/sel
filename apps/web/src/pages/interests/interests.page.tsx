import { useQuery } from '@tanstack/solid-query';
import { createSignal, For, Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { BoxSkeleton } from 'src/components/skeleton';
import { createTranslate } from 'src/intl/translate';

import { InterestItem } from './components/interest-item';

const T = createTranslate('pages.interests');

export function InterestsPage() {
  const query = useQuery(() => apiQuery('listInterests', {}));
  const [expanded, setExpanded] = createSignal<string>();

  return (
    <>
      <div class="mb-8 row items-center justify-between gap-4">
        <h1>
          <T id="title" />
        </h1>
      </div>

      <Show when={query.data} fallback={<Skeleton />}>
        {(interests) => (
          <ul class="col gap-8">
            <For each={interests()}>
              {(interest) => (
                <InterestItem
                  interest={interest}
                  expanded={expanded() === interest.id}
                  toggleExpanded={() =>
                    expanded() === interest.id ? setExpanded() : setExpanded(interest.id)
                  }
                />
              )}
            </For>
          </ul>
        )}
      </Show>
    </>
  );
}

function Skeleton() {
  return (
    <div class="col gap-8">
      <BoxSkeleton height={10} />
      <BoxSkeleton height={10} />
      <BoxSkeleton height={10} />
    </div>
  );
}
