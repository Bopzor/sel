import { Request, RequestStatus } from '@sel/shared';
import { createMutation } from '@tanstack/solid-query';
import { createSignal, Show } from 'solid-js';

import { Button } from '../../../../components/button';
import { useInvalidateApi } from '../../../../infrastructure/api';
import { container } from '../../../../infrastructure/container';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';
import { getIsAuthenticatedMember } from '../../../../utils/authenticated-member';
import { CreateTransactionDialog } from '../../../transactions/create-transaction-dialog';

const T = Translate.prefix('requests');

export function RequestActions(props: { request: Request }) {
  const api = container.resolve(TOKENS.api);
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const isRequester = () => isAuthenticatedMember(props.request.requester);
  const canCancel = () => isRequester() && props.request.status === RequestStatus.pending;

  const mutation = createMutation(() => ({
    async mutationFn() {
      await api.cancelRequest({ path: { requestId: props.request.id } });
    },
    async onSuccess() {
      await invalidate(['getRequest', props.request.id]);
    },
  }));

  return (
    <>
      <CreateTransactionButton request={props.request} />

      <Show when={canCancel()}>
        <Button variant="secondary" onClick={() => mutation.mutate()} loading={mutation.isPending}>
          <T id="cancel" />
        </Button>
      </Show>
    </>
  );
}

function CreateTransactionButton(props: { request: Request }) {
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const canCreateTransaction = () => props.request.status === RequestStatus.pending;
  const api = container.resolve(TOKENS.api);
  const [open, setOpen] = createSignal(false);

  return (
    <Show when={canCreateTransaction()}>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <T id="createExchange" />
      </Button>

      <CreateTransactionDialog
        open={open()}
        onClose={() => setOpen(false)}
        createTransaction={(values) =>
          api.createRequestTransaction({ path: { requestId: props.request.id }, body: values })
        }
        initialDescription={props.request.title}
        member={isAuthenticatedMember(props.request.requester) ? undefined : props.request.requester}
        type={isAuthenticatedMember(props.request.requester) ? 'send' : 'request'}
      />
    </Show>
  );
}
