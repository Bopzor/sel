import { useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { Breadcrumb, breadcrumb } from 'src/components/breadcrumb';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';

import { RequestAnswer } from './sections/request-answer';
import { RequestAnswerList } from './sections/request-answer-list';
import { RequestAuthor } from './sections/request-author';
import { RequestComments } from './sections/request-comments';
import { RequestDescription } from './sections/request-description';
import { RequestHeader } from './sections/request-header';
import { RequestTransaction } from './sections/request-transaction';

export function RequestDetailsPage() {
  const params = useParams<{ requestId: string }>();
  const query = createQuery(() => apiQuery('getRequest', { path: { requestId: params.requestId } }));

  return (
    <>
      <Breadcrumb items={[breadcrumb.requests(), query.data && breadcrumb.request(query.data)]} />

      <Show when={query.data} fallback={<Skeleton />}>
        {(request) => (
          <div class="grid gap-x-8 gap-y-12 lg:grid-cols-3">
            <div class="lg:col-span-3">
              <RequestHeader request={request()} />
            </div>

            <div class="col gap-12 lg:col-span-2">
              <RequestDescription request={request()} />
              <RequestAnswer request={request()} />
              <RequestComments request={request()} />
            </div>

            <div class="col max-w-lg gap-12">
              <RequestAuthor request={request()} />
              <RequestTransaction request={request()} />
              <RequestAnswerList request={request()} />
            </div>
          </div>
        )}
      </Show>
    </>
  );
}

function Skeleton() {
  return (
    <div class="grid gap-x-8 gap-y-12 lg:grid-cols-3">
      <div class="lg:col-span-3">
        <TextSkeleton width={32} class="text-xl lg:text-3xl" />
      </div>

      <div class="col gap-12 lg:col-span-2">
        <BoxSkeleton height={24} />
      </div>

      <div class="col max-w-lg gap-12">
        <BoxSkeleton height={16} />
      </div>
    </div>
  );
}
