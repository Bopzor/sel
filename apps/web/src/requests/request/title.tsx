import { useIntl } from '@cookbook/solid-intl';
import { Request } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { pencil } from 'solid-heroicons/solid';
import { Show } from 'solid-js';

import { LinkButton } from '../../components/button';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { select, selectCanEditRequest } from '../../store/app-store';

const T = Translate.prefix('requests');

type TitleProps = {
  request?: Request;
};

export function Title(props: TitleProps) {
  const intl = useIntl();

  const canEdit = select(selectCanEditRequest);

  return (
    <div class="col mb-6 gap-2">
      <div class="row items-center justify-between">
        <h1 class="self-start">{props.request?.title}</h1>

        <Show when={canEdit()}>
          <LinkButton variant="secondary" href={routes.requests.edit(props.request?.id ?? '')} class="ml-4">
            <Icon path={pencil} class="h-em w-em text-icon" />
            <T id="editRequest" />
          </LinkButton>
        </Show>
      </div>

      <div class="text-sm text-dim">
        <T
          id="date"
          values={{
            date: intl.formatDate(props.request?.date, {
              dateStyle: 'long',
              timeStyle: 'short',
            }),
          }}
        />
      </div>
    </div>
  );
}
