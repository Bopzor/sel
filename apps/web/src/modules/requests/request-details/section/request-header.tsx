import { Request, RequestStatus as RequestStatusEnum } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { pencil } from 'solid-heroicons/solid';
import { Show } from 'solid-js';

import { isAuthenticatedMember } from '../../../../app-context';
import { LinkButton } from '../../../../components/button';
import { Translate } from '../../../../intl/translate';
import { routes } from '../../../../routes';
import { RequestStatus } from '../../components/request-status';

const T = Translate.prefix('requests');

export function RequestHeader(props: { request: Request }) {
  const isRequester = () => isAuthenticatedMember(props.request.requester);

  return (
    // eslint-disable-next-line tailwindcss/no-arbitrary-value
    <div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-[1fr_auto]">
      <h1>{props.request.title}</h1>

      <div class="sm:order-1 sm:col-span-2">
        <RequestMetadata request={props.request} />
      </div>

      <div>
        <Show when={isRequester()}>
          <EditButton request={props.request} />
        </Show>
      </div>
    </div>
  );
}

function EditButton(props: { request: Request }) {
  return (
    <LinkButton variant="secondary" href={routes.requests.edit(props.request.id)}>
      <Icon path={pencil} class="size-em text-icon" />
      <T id="editRequest" />
    </LinkButton>
  );
}

function RequestMetadata(props: { request: Request }) {
  const positiveAnswers = () => props.request.answers.filter(hasProperty('answer', 'positive'));

  return (
    <div class="col sm:row gap-3 text-sm text-dim">
      <T id="date" values={{ date: new Date(props.request.date) }} />

      <div class="hidden sm:block">&bullet;</div>

      <div class="row gap-3">
        <RequestStatus status={props.request.status} />

        <Show when={props.request.status === RequestStatusEnum.pending && positiveAnswers().length > 0}>
          <T id="numberOfPositiveAnswers" values={{ count: positiveAnswers().length }} />
        </Show>
      </div>
    </div>
  );
}
