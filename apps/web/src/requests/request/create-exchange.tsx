import { Request } from '@sel/shared';
import { Show } from 'solid-js';

import { Button } from '../../components/button';
import { Translate } from '../../intl/translate';
import {
  getAppActions,
  select,
  selectCanCancelRequest,
  selectCanCreateRequestExchange,
} from '../../store/app-store';
import { notify } from '../../utils/notify';

const T = Translate.prefix('requests');

type CreateExchangeProps = {
  request?: Request;
};

export function CreateExchange(props: CreateExchangeProps) {
  const t = T.useTranslation();

  const canCreateExchange = select(selectCanCreateRequestExchange);
  const canCancel = select(selectCanCancelRequest);
  const { cancelRequest } = getAppActions();

  return (
    <>
      <Show when={canCreateExchange()}>
        <Button variant="primary" onClick={() => notify.info(t('notAvailable'))}>
          <T id="createExchange" />
        </Button>
      </Show>

      <Show when={canCancel()}>
        <Button variant="secondary" onClick={() => void cancelRequest(props.request?.id ?? '')}>
          <T id="cancel" />
        </Button>
      </Show>
    </>
  );
}
