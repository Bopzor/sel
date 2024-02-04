import { useIntl } from '@cookbook/solid-intl';
import { Request } from '@sel/shared';
import { For, Show, onMount } from 'solid-js';

import { BackLink } from '../components/back-link';
import { LinkButton } from '../components/button';
import { Link } from '../components/link';
import { SuspenseLoader } from '../components/loader';
import { MemberAvatarName } from '../components/member-avatar-name';
import { RichText } from '../components/rich-text';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import {
  getAppActions,
  select,
  selectNotPendingRequests,
  selectPendingRequests,
  selectRequests,
} from '../store/app-store';

import { RequestStatus } from './request-status';

const T = Translate.prefix('requests');

export function RequestsPage() {
  const { loadRequests } = getAppActions();

  onMount(loadRequests);

  const requests = select(selectRequests);
  const pendingRequests = select(selectPendingRequests);
  const notPendingRequests = select(selectNotPendingRequests);

  return (
    <>
      <BackLink href={routes.home} />

      <div class="row justify-between">
        <h1>
          <T id="title" />
        </h1>

        <LinkButton href={routes.requests.create}>
          <T id="newRequest" />
        </LinkButton>
      </div>

      <SuspenseLoader>
        <Show when={(requests()?.length ?? 0) === 0}>
          <div class="fallback min-h-32">
            <T id="noRequests" />
          </div>
        </Show>

        <div class="mt-6 max-w-4xl">
          <Show when={(pendingRequests()?.length ?? 0) > 0}>
            <ul class="col gap-6">
              <For each={pendingRequests()}>{(request) => <RequestListItem request={request} />}</For>
            </ul>
          </Show>

          <Show when={(notPendingRequests()?.length ?? 0) > 0}>
            <div role="separator" class="row my-6 items-center gap-4">
              <span class="flex-1 border-t" />
              <T id="passedRequests" />
              <span class="flex-1 border-t" />
            </div>

            <ul class="col gap-6 opacity-50">
              <For each={notPendingRequests()}>{(request) => <RequestListItem request={request} />}</For>
            </ul>
          </Show>
        </div>
      </SuspenseLoader>
    </>
  );
}

type RequestListItemProps = {
  request: Request;
};

function RequestListItem(props: RequestListItemProps) {
  const intl = useIntl();

  return (
    <li class="rounded-lg bg-neutral p-4 shadow">
      <Link unstyled href={routes.requests.request(props.request.id)}>
        <div class="sm:row flex flex-col-reverse justify-between gap-4 sm:items-center">
          <div class="row items-center gap-4">
            <MemberAvatarName member={props.request.requester} classes={{ name: 'text-lg' }} />
          </div>

          <div class="row gap-3 text-dim">
            {intl.formatDate(props.request.date, {
              dateStyle: 'long',
            })}

            <span>&bullet;</span>

            <RequestStatus status={props.request.status} />
          </div>
        </div>

        <h2 class="mb-4 mt-6">{props.request.title}</h2>

        <RichText class="line-clamp-3">{props.request.body}</RichText>
      </Link>
    </li>
  );
}
