import { Request, RequestStatus } from '@sel/shared';
import { Show } from 'solid-js';

import { isAuthenticatedMember } from '../../../../app-context';
import { Button } from '../../../../components/button';
import { container } from '../../../../infrastructure/container';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';
import { createAsyncCall } from '../../../../utils/async-call';
import { notify } from '../../../../utils/notify';

const T = Translate.prefix('requests');

export function RequestActions(props: { request: Request; onCanceled: () => void }) {
  const requestApi = container.resolve(TOKENS.requestApi);

  const t = T.useTranslation();

  const isRequester = () => isAuthenticatedMember(props.request.requester);

  const canCreateExchange = () => props.request.status === RequestStatus.pending;
  const canCancel = () => isRequester() && props.request.status === RequestStatus.pending;

  const [cancelRequest, isCanceling] = createAsyncCall(requestApi.cancelRequest.bind(requestApi), {
    onSuccess: props.onCanceled,
  });

  return (
    <>
      <Show when={canCreateExchange()}>
        <Button variant="primary" onClick={() => notify.info(t('notAvailable'))}>
          <T id="createExchange" />
        </Button>
      </Show>

      <Show when={canCancel()}>
        <Button variant="secondary" onClick={() => cancelRequest(props.request.id)} loading={isCanceling()}>
          <T id="cancel" />
        </Button>
      </Show>
    </>
  );
}
