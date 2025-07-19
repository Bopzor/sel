import { Request, RequestStatus as RequestStatusEnum } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { useMutation } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { bell, check, pencil, xMark } from 'solid-heroicons/solid';
import { createSignal, Show } from 'solid-js';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { getIsAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Button } from 'src/components/button';
import { Dialog, DialogFooter, DialogHeader } from 'src/components/dialog';
import { ButtonMenuItem, LinkMenuItem, Menu } from 'src/components/menu';
import { FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { RequestStatus } from '../../components/request-status';
import { RequestTransactionDialog } from './request-transaction';

const T = createTranslate('pages.requests.details.header');

export function RequestHeader(props: { request: Request }) {
  const [openDialog, setOpenDialog] = createSignal<'fulfil' | 'transaction'>();
  const closeDialog = () => setOpenDialog(undefined);

  const positiveAnswers = () => props.request.answers.filter(hasProperty('answer', 'positive'));

  const fulfil = createFulfilMutation({ request: () => props.request, onSuccess: closeDialog });

  return (
    <header class="col gap-2">
      <div class="row items-center justify-between">
        <h2 class="text-2xl font-semibold lg:text-3xl">{props.request.title}</h2>

        <RequestActions
          request={props.request}
          openFulfilConfirmationDialog={() => setOpenDialog('fulfil')}
        />

        <FulfilConfirmationDialog
          open={openDialog() === 'fulfil'}
          onClose={closeDialog}
          request={props.request}
          openTransactionDialog={() => setOpenDialog('transaction')}
        />

        <RequestTransactionDialog
          open={openDialog() === 'transaction'}
          onClose={closeDialog}
          request={props.request}
          onCreated={() => fulfil.mutateAsync()}
        />
      </div>

      <div class="row items-center gap-4">
        <div class="text-sm text-dim">
          <T
            id="date"
            values={{ date: <FormattedDate date={props.request.date} dateStyle="long" timeStyle="short" /> }}
          />
        </div>

        <div class="self-stretch border-l" />

        <RequestStatus status={props.request.status} />

        <Show when={positiveAnswers().length > 0}>
          <div class="hidden text-sm text-dim sm:block">
            <T id="positiveAnswers" values={{ count: positiveAnswers().length }} />
          </div>
        </Show>
      </div>
    </header>
  );
}

function RequestActions(props: { request: Request; openFulfilConfirmationDialog: () => void }) {
  const t = T.useTranslate();
  const [open, setOpen] = createSignal(false);

  const isAuthenticatedMember = getIsAuthenticatedMember();
  const isRequester = () => isAuthenticatedMember(props.request.requester);

  const cancel = createCancelMutation({ request: () => props.request, onSuccess: () => setOpen(false) });
  const fulfil = createFulfilMutation({ request: () => props.request, onSuccess: () => setOpen(false) });

  return (
    <Menu open={open()} setOpen={setOpen} placement="bottom-end">
      <Show when={isRequester()}>
        <LinkMenuItem
          href={routes.requests.edit(props.request.id)}
          start={<Icon path={pencil} class="size-4 text-dim" />}
          onClick={() => setOpen(false)}
        >
          <T id="actions.edit" />
        </LinkMenuItem>
      </Show>

      <Show when={isRequester() && props.request.status === RequestStatusEnum.pending}>
        <ButtonMenuItem
          start={<Icon path={check} class="size-4 text-dim" />}
          loading={fulfil.isPending}
          onClick={() => {
            if (props.request.hasTransactions) {
              return fulfil.mutate();
            } else {
              setOpen(false);
              props.openFulfilConfirmationDialog();
            }
          }}
        >
          <T id="actions.fulfil" />
        </ButtonMenuItem>
      </Show>

      <Show when={isRequester() && props.request.status === RequestStatusEnum.pending}>
        <ButtonMenuItem
          start={<Icon path={xMark} class="size-4 text-dim" />}
          loading={cancel.isPending}
          onClick={() => cancel.mutate()}
        >
          <T id="actions.cancel" />
        </ButtonMenuItem>
      </Show>

      <ButtonMenuItem
        start={<Icon path={bell} class="size-4 text-dim" />}
        onClick={() => {
          notify.info(t('actions.notificationsSettingsUnavailable'));
          setOpen(false);
        }}
      >
        <T id="actions.notifications" />
      </ButtonMenuItem>
    </Menu>
  );
}

function FulfilConfirmationDialog(props: {
  open: boolean;
  onClose: () => void;
  request: Request;
  openTransactionDialog: () => void;
}) {
  const fulfil = createFulfilMutation({ request: () => props.request, onSuccess: () => props.onClose() });

  return (
    <Dialog open={props.open} onClose={() => props.onClose()} class="max-w-xl">
      <DialogHeader title={<T id="fulfilConfirmationDialog.title" />} onClose={() => props.onClose()} />

      <T id="fulfilConfirmationDialog.content" />

      <DialogFooter class="justify-center">
        <Button variant="solid" onClick={() => props.openTransactionDialog()}>
          <T id="fulfilConfirmationDialog.createTransaction" />
        </Button>
        <Button variant="outline" loading={fulfil.isPending} onClick={() => fulfil.mutate()}>
          <T id="fulfilConfirmationDialog.fulfilRequest" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function createCancelMutation({ request, onSuccess }: { request: () => Request; onSuccess: () => void }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  return useMutation(() => ({
    async mutationFn() {
      await api.cancelRequest({ path: { requestId: request().id } });
    },
    async onSuccess() {
      await invalidate('getRequest', { path: { requestId: request().id } });
      notify.success(t('actions.cancelSuccess'));
      onSuccess();
    },
  }));
}

function createFulfilMutation({ request, onSuccess }: { request: () => Request; onSuccess: () => void }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  return useMutation(() => ({
    async mutationFn() {
      await api.fulfilRequest({ path: { requestId: request().id } });
    },
    async onSuccess() {
      await invalidate('getRequest', { path: { requestId: request().id } });
      notify.success(t('actions.fulfilSuccess'));
      onSuccess();
    },
  }));
}
