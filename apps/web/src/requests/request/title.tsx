import { Request, RequestStatus } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { pencil } from 'solid-heroicons/solid';
import { Show } from 'solid-js';

import { LinkButton } from '../../components/button';
import { FormattedDate } from '../../intl/formatted';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { select, selectCanEditRequest } from '../../store/app-store';

const T = Translate.prefix('requests');

const TranslateRequestStatus = Translate.enum('requests.status');

type TitleProps = {
  request?: Request;
};

export function Title(props: TitleProps) {
  const canEdit = select(selectCanEditRequest);

  return (
    <div class="col md:row mb-6 items-start justify-between gap-4">
      <div class="col gap-2">
        <h1 class="self-start">{props.request?.title}</h1>

        <div class="row gap-3 text-sm text-dim">
          <T
            id="date"
            values={{ date: <FormattedDate date={props.request?.date} dateStyle="long" timeStyle="short" /> }}
          />

          <span>&bullet;</span>

          <span
            class="font-semibold"
            classList={{
              'text-green-600 dark:text-green-400': props.request?.status === RequestStatus.pending,
              'text-yellow-600 dark:text-yellow-400': props.request?.status === RequestStatus.canceled,
            }}
          >
            <TranslateRequestStatus value={props.request?.status ?? ''} />
          </span>
        </div>
      </div>

      <Show when={canEdit()}>
        <LinkButton variant="secondary" href={routes.requests.edit(props.request?.id ?? '')}>
          <Icon path={pencil} class="h-em w-em text-icon" />
          <T id="editRequest" />
        </LinkButton>
      </Show>
    </div>
  );
}
