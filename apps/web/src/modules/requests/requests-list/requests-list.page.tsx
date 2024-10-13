import { Request, RequestStatus } from '@sel/shared';
import { hasProperty, not } from '@sel/utils';
import { createQuery } from '@tanstack/solid-query';
import { For, Show } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { LinkButton } from '../../../components/button';
import { Link } from '../../../components/link';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { RichText } from '../../../components/rich-text';
import { container } from '../../../infrastructure/container';
import { FormattedDate } from '../../../intl/formatted';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { RequestStatus as RequestStatusComponent } from '../components/request-status';

const T = Translate.prefix('requests');

export default function RequestsListPage() {
  const api = container.resolve(TOKENS.api);

  const query = createQuery(() => ({
    queryKey: ['listRequests'],
    queryFn: () => api.listRequests({}),
  }));

  return (
    <>
      <Breadcrumb items={[breadcrumb.requests()]} />

      <Header />

      <Show when={query.data}>{(requests) => <RequestsList requests={requests()} />}</Show>
    </>
  );
}

function RequestsList(props: { requests: Request[] }) {
  const pendingRequests = () => props.requests.filter(hasProperty('status', RequestStatus.pending));
  const notPendingRequests = () => props.requests.filter(not(hasProperty('status', RequestStatus.pending)));

  return (
    <>
      <Show when={(props.requests.length ?? 0) === 0}>
        <div class="fallback min-h-32">
          <T id="noRequests" />
        </div>
      </Show>

      <div class="mt-6 max-w-4xl">
        <Show when={(pendingRequests()?.length ?? 0) > 0}>
          <ul class="col gap-6">
            <For each={pendingRequests()}>{(request) => <RequestItem request={request} />}</For>
          </ul>
        </Show>

        <Show when={(notPendingRequests()?.length ?? 0) > 0}>
          <div role="separator" class="row my-6 items-center gap-4">
            <span class="flex-1 border-t" />
            <T id="passedRequests" />
            <span class="flex-1 border-t" />
          </div>

          <ul class="col gap-6 opacity-50">
            <For each={notPendingRequests()}>{(request) => <RequestItem request={request} />}</For>
          </ul>
        </Show>
      </div>
    </>
  );
}

function Header() {
  return (
    <div class="row justify-between">
      <h1>
        <T id="title" />
      </h1>

      <LinkButton href={routes.requests.create}>
        <T id="newRequest" />
      </LinkButton>
    </div>
  );
}

function RequestItem(props: { request: Request }) {
  return (
    <li class="rounded-lg bg-neutral p-4 shadow">
      <Link unstyled href={routes.requests.request(props.request.id)}>
        <div class="sm:row flex flex-col-reverse justify-between gap-4 sm:items-center">
          <div class="row items-center gap-4">
            <MemberAvatarName member={props.request.requester} classes={{ name: 'text-lg' }} />
          </div>

          <div class="row gap-3 text-dim">
            <FormattedDate date={props.request.date} dateStyle="long" />

            <span>&bullet;</span>

            <RequestStatusComponent status={props.request.status} />
          </div>
        </div>

        <h2 class="mb-4 mt-6">{props.request.title}</h2>

        <RichText class="line-clamp-3">{props.request.body}</RichText>
      </Link>
    </li>
  );
}
