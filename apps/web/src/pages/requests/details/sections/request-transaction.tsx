import { Request } from '@sel/shared';
import { createSignal } from 'solid-js';

import { api } from 'src/application/api';
import { getIsAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { TransactionDialog } from 'src/components/transaction-dialog';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.requests.details.actions');

export function RequestTransaction(props: { request: Request }) {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <T id="createTransaction" />
      </Button>

      <RequestTransactionDialog open={open()} onClose={() => setOpen(false)} request={props.request} />
    </>
  );
}

export function RequestTransactionDialog(props: {
  open: boolean;
  onClose: () => void;
  request: Request;
  onCreated?: () => Promise<unknown>;
}) {
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const invalidate = useInvalidateApi();

  return (
    <TransactionDialog
      open={props.open}
      onClose={() => props.onClose()}
      onCreate={(body) => api.createRequestTransaction({ path: { requestId: props.request.id }, body })}
      onCreated={() => {
        return Promise.all([
          invalidate('getRequest', { path: { requestId: props.request.id } }),
          props.onCreated?.(),
        ]);
      }}
      initialValues={{
        type: isAuthenticatedMember(props.request.requester) ? 'send' : 'request',
        memberId: isAuthenticatedMember(props.request.requester) ? undefined : props.request.requester.id,
        description: props.request.title,
      }}
    />
  );
}
