import { useIntl } from '@cookbook/solid-intl';
import { Request } from '@sel/shared';
import { For, onMount } from 'solid-js';

import { BackLink } from '../components/back-link';
import { LinkButton } from '../components/button';
import { Feature, FeatureFlag } from '../components/feature-flag';
import { Link } from '../components/link';
import { SuspenseLoader } from '../components/loader';
import { MemberAvatarName } from '../components/member-avatar-name';
import { RichText } from '../components/rich-text';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { getAppActions, select, selectNotPendingRequests, selectPendingRequests } from '../store/app-store';

import { RequestStatus } from './request-status';

const T = Translate.prefix('requests');

export function RequestsPage() {
  const { loadRequests } = getAppActions();

  onMount(loadRequests);

  const pendingRequests = select(selectPendingRequests);
  const notPendingRequests = select(selectNotPendingRequests);

  return (
    <FeatureFlag feature={Feature.requests} fallback={<RequestsPlaceholderPage />}>
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
        <div class="mt-6 max-w-4xl">
          <ul class="col gap-6">
            <For each={pendingRequests()}>{(request) => <RequestListItem request={request} />}</For>
          </ul>

          <div role="separator" class="row my-6 items-center gap-4">
            <span class="flex-1 border-t" />
            <T id="passedRequests" />
            <span class="flex-1 border-t" />
          </div>

          <ul class="col gap-6 opacity-50">
            <For each={notPendingRequests()}>{(request) => <RequestListItem request={request} />}</For>
          </ul>
        </div>
      </SuspenseLoader>
    </FeatureFlag>
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
        <div class="row items-center justify-between">
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

function RequestsPlaceholderPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="requests.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="requests.sentence1" />
      </p>

      <p>
        <Translate id="requests.sentence2" />
      </p>
    </div>
  );
}
