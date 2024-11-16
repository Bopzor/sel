import { Request, RequestStatus } from '@sel/shared';
import { createMutation } from '@tanstack/solid-query';
import { createSignal, Show } from 'solid-js';

import { Button } from '../../../../components/button';
import { Dialog, DialogHeader } from '../../../../components/dialog';
import { useInvalidateApi } from '../../../../infrastructure/api';
import { container } from '../../../../infrastructure/container';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';
import { getIsAuthenticatedMember } from '../../../../utils/authenticated-member';
import { notify } from '../../../../utils/notify';
import { CreateTransactionDialog } from '../../../transactions/create-transaction-dialog';

const T = Translate.prefix('requests');

export function RequestActions(props: { request: Request }) {
  const api = container.resolve(TOKENS.api);
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const invalidate = useInvalidateApi();
  const t = T.useTranslation();

  const isRequester = () => isAuthenticatedMember(props.request.requester);

  const fulfilMutation = createMutation(() => ({
    async mutationFn() {
      await api.fulfilRequest({ path: { requestId: props.request.id } });
    },
    async onSuccess() {
      await invalidate(['getRequest', props.request.id]);
      notify.success(t('fulfilled'));
    },
  }));

  const cancelMutation = createMutation(() => ({
    async mutationFn() {
      await api.cancelRequest({ path: { requestId: props.request.id } });
    },
    async onSuccess() {
      await invalidate(['getRequest', props.request.id]);
      notify.success(t('canceled'));
    },
  }));

  const [fulfilConfirmationDialogOpen, setFulfilConfirmationDialogOpen] = createSignal(false);
  const [createTransactionDialogOpen, setCreateTransactionDialogOpen] = createSignal(false);

  const handleFulfil = () => {
    if (props.request.hasTransactions) {
      fulfilMutation.mutate();
    } else {
      setFulfilConfirmationDialogOpen(true);
    }
  };

  return (
    <div
      title={props.request.status !== RequestStatus.pending ? t('notPending') : undefined}
      class="grid grid-cols-2 gap-4"
    >
      <CreateTransactionButton
        open={createTransactionDialogOpen()}
        setOpen={setCreateTransactionDialogOpen}
        request={props.request}
      />

      <Show when={isRequester()}>
        <Button
          variant="primary"
          disabled={props.request.status !== RequestStatus.pending}
          onClick={handleFulfil}
          loading={fulfilMutation.isPending}
        >
          <T id="fulfil" />
        </Button>

        <Button
          variant="secondary"
          disabled={props.request.status !== RequestStatus.pending}
          onClick={() => cancelMutation.mutate()}
          loading={cancelMutation.isPending}
        >
          <T id="cancel" />
        </Button>
      </Show>

      <Dialog
        open={fulfilConfirmationDialogOpen()}
        onClose={() => setFulfilConfirmationDialogOpen(false)}
        width={1}
      >
        <DialogHeader
          title={<T id="fulfilConfirmationDialog.title" />}
          onClose={() => setFulfilConfirmationDialogOpen(false)}
        />

        <p>
          <T id="fulfilConfirmationDialog.content" />
        </p>

        <div class="row mt-8 items-center justify-center gap-4">
          <Button
            variant="primary"
            onClick={() => {
              setFulfilConfirmationDialogOpen(false);
              setCreateTransactionDialogOpen(true);
            }}
          >
            <T id="fulfilConfirmationDialog.createExchange" />
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              fulfilMutation.mutate();
              setFulfilConfirmationDialogOpen(false);
            }}
          >
            <T id="fulfilConfirmationDialog.fulfilRequest" />
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

type CreateTransactionButtonProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  request: Request;
};

function CreateTransactionButton(props: CreateTransactionButtonProps) {
  const invalidate = useInvalidateApi();
  const api = container.resolve(TOKENS.api);

  const isAuthenticatedMember = getIsAuthenticatedMember();
  const canCreateTransaction = () => props.request.status === RequestStatus.pending;

  return (
    <>
      <Button
        variant="primary"
        disabled={!canCreateTransaction()}
        onClick={() => props.setOpen(true)}
        class="col-span-2"
      >
        <T id="createExchange" />
      </Button>

      <CreateTransactionDialog
        open={props.open}
        onClose={() => props.setOpen(false)}
        createTransaction={(values) =>
          api.createRequestTransaction({ path: { requestId: props.request.id }, body: values })
        }
        onCreated={() => invalidate(['getRequest', props.request.id])}
        initialDescription={props.request.title}
        member={isAuthenticatedMember(props.request.requester) ? undefined : props.request.requester}
        type={isAuthenticatedMember(props.request.requester) ? 'send' : 'request'}
      />
    </>
  );
}
