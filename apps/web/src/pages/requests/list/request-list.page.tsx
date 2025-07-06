import { Request } from '@sel/shared';
import { createQuery } from '@tanstack/solid-query';
import { For, Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Breadcrumb, breadcrumb } from 'src/components/breadcrumb';
import { LinkButton } from 'src/components/button';
import { Link } from 'src/components/link';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { RichText } from 'src/components/rich-text';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';
import { FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { RequestStatus } from '../components/request-status';

const T = createTranslate('pages.requests.list');

export function RequestListPage() {
  const query = createQuery(() => apiQuery('listRequests', {}));

  return (
    <>
      <Breadcrumb items={[breadcrumb.requests()]} />

      <div class="row mb-8 items-center justify-between gap-4">
        <h1>
          <T id="title" />
        </h1>

        <LinkButton href={routes.requests.create}>
          <T id="createRequest" />
        </LinkButton>
      </div>

      <Show when={query.data} fallback={<Skeleton />}>
        {(requests) => (
          <ul class="col max-w-4xl gap-8">
            <For each={requests()}>{(request) => <RequestItem request={request} />}</For>
          </ul>
        )}
      </Show>
    </>
  );
}

function Skeleton() {
  return (
    <div class="col max-w-4xl gap-8">
      <For each={Array(3).fill(null)}>
        {() => (
          <div class="col gap-2">
            <TextSkeleton width={12} />
            <BoxSkeleton height={8} />
          </div>
        )}
      </For>
    </div>
  );
}

function RequestItem(props: { request: Request }) {
  return (
    <li class="col gap-2">
      <div class="row items-end justify-between">
        <MemberAvatarName member={props.request.requester} />
        <div class="text-xs text-dim">
          <FormattedDate date={props.request.date} dateStyle="medium" timeStyle="medium" />
        </div>
      </div>

      <Link
        href={`/requests/${props.request.id}`}
        class="col col-span-2 gap-4 rounded-lg bg-neutral p-4 shadow-sm"
      >
        <div class="row justify-between gap-4">
          <div class="text-xl font-medium">{props.request.title}</div>
          <RequestStatus status={props.request.status} />
        </div>

        <RichText class="line-clamp-3">{props.request.body}</RichText>
      </Link>
    </li>
  );
}
