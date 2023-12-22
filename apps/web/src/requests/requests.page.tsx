import { useIntl } from '@cookbook/solid-intl';
import { Request } from '@sel/shared';
import { For, onMount } from 'solid-js';

import { BackLink } from '../components/back-link';
import { LinkButton } from '../components/button';
import { Link } from '../components/link';
import { SuspenseLoader } from '../components/loader';
import { MemberAvatarName } from '../components/member-avatar-name';
import { RichText } from '../components/rich-text';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { getAppState, getMutations } from '../store/app-store';

const T = Translate.prefix('requests');

export function RequestsPage() {
  const state = getAppState();
  const { loadRequests } = getMutations();

  onMount(loadRequests);

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
        <ul class="col mt-6 gap-6">
          <For each={state.requests}>{(request) => <RequestListItem request={request} />}</For>
        </ul>
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
    <li class="max-w-4xl rounded-lg bg-neutral p-4 shadow">
      <Link unstyled href={routes.requests.request(props.request.id)}>
        <div class="row items-center justify-between">
          <div class="row items-center gap-4">
            <MemberAvatarName member={props.request.requester} classes={{ name: 'text-lg' }} />
          </div>

          <div class="text-dim">
            {intl.formatDate(props.request.date, {
              dateStyle: 'long',
            })}
          </div>
        </div>

        <h2 class="mb-4 mt-6">{props.request.title}</h2>

        <RichText class="line-clamp-3">{props.request.body}</RichText>
      </Link>
    </li>
  );
}
