import { Request } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { pencil } from 'solid-heroicons/solid';
import { Show } from 'solid-js';

import { LinkButton } from '../../components/button';
import { FormattedDate } from '../../intl/formatted';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { select, selectCanEditRequest } from '../../store/app-store';
import { RequestStatus } from '../request-status';

const T = Translate.prefix('requests');

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

          <RequestStatus status={props.request?.status} />
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
