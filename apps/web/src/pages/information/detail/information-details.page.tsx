import { useParams } from '@solidjs/router';
import { useQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { card } from 'src/components/card';
import { Comments } from 'src/components/comments';
import { Message } from 'src/components/message';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';

import { InformationHeader } from './sections/information-header';

export function InformationDetailsPage() {
  const { informationId } = useParams<{ informationId: string }>();
  const query = useQuery(() => apiQuery('getInformation', { path: { informationId } }));

  return (
    <Show when={query.data} fallback={<Skeleton />}>
      {(information) => (
        <div class="col gap-8">
          <section>
            <InformationHeader information={information()} />

            <div class={card.content()}>
              <h1 class="mb-4 text-3xl">{query.data?.title}</h1>
              <Message message={query.data?.message} />
            </div>
          </section>

          <Comments entityType="information" entityId={information().id} />
        </div>
      )}
    </Show>
  );
}

function Skeleton() {
  return (
    <div class="col gap-x-8 gap-y-12">
      <TextSkeleton width={32} class="text-xl lg:text-3xl" />
      <BoxSkeleton height={24} />
      <BoxSkeleton height={16} />
    </div>
  );
}
