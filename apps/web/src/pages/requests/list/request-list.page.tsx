import { Request } from '@sel/shared';
import { useQuery } from '@tanstack/solid-query';
import { For } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { LinkButton } from 'src/components/button';
import { Link } from 'src/components/link';
import { List } from 'src/components/list';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { Message } from 'src/components/message';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';
import { FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { RequestStatus } from '../components/request-status';

const T = createTranslate('pages.requests.list');

export function RequestListPage() {
  const query = useQuery(() => apiQuery('listRequests', {}));

  return (
    <>
      <div class="mb-8 row items-center justify-between gap-4">
        <h1>
          <T id="title" />
        </h1>

        <LinkButton href={routes.requests.create}>
          <T id="createRequest" />
        </LinkButton>
      </div>

      <List each={query.data} fallback={<Skeleton />} class="col max-w-4xl gap-8">
        {(request) => <RequestItem request={request} />}
      </List>
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
        class="col-span-2 col gap-4 rounded-lg bg-neutral p-4 shadow-sm"
      >
        <div class="row justify-between gap-4">
          <div class="text-xl font-medium">{props.request.title}</div>
          <RequestStatus status={props.request.status} />
        </div>

        <Message class="line-clamp-3" message={props.request.message} />
      </Link>
    </li>
  );
}
