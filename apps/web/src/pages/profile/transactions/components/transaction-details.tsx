import { Transaction, TransactionStatus as TransactionStatusEnum } from '@sel/shared';
import { createMutation } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { check, xMark, arrowRight, minus } from 'solid-heroicons/solid';
import { Show } from 'solid-js';

import { api } from 'src/application/api';
import { getLetsConfig } from 'src/application/config';
import { notify } from 'src/application/notify';
import { getAuthenticatedMember, getIsAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { DialogFooter } from 'src/components/dialog';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { TransactionStatus } from 'src/components/transaction-status';
import { FormattedDate, FormattedCurrencyAmount } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.profile.transactions');

export function TransactionDetails(props: { transaction: Transaction }) {
  const config = getLetsConfig();
  const isAuthenticatedMember = getIsAuthenticatedMember();

  const accept = createAcceptMutation(() => props.transaction.id);
  const cancel = createCancelMutation(() => props.transaction.id);

  return (
    <div class="col gap-6">
      <div class="row gap-4">
        <FormattedDate date={props.transaction.date} dateStyle="long" timeStyle="short" />
        <TransactionStatus status={props.transaction.status} />
      </div>

      <div class="text-2xl font-medium lg:text-center">{props.transaction.description}</div>

      <TransactionStakeholdersMobile transaction={props.transaction} />
      <TransactionStakeholdersDesktop transaction={props.transaction} />

      <Show when={props.transaction.status === TransactionStatusEnum.completed}>
        <div />
      </Show>

      <Show when={props.transaction.status === TransactionStatusEnum.canceled}>
        <div class="text-dim">
          <T id="canceled" values={{ currency: config()?.currency }} />
        </div>
      </Show>

      <Show
        when={
          props.transaction.status === TransactionStatusEnum.pending &&
          isAuthenticatedMember(props.transaction.recipient)
        }
      >
        <div class="text-dim">
          <T id="pendingRecipient" values={{ payer: props.transaction.payer.firstName }} />
        </div>
      </Show>

      <Show
        when={
          props.transaction.status === TransactionStatusEnum.pending &&
          isAuthenticatedMember(props.transaction.payer)
        }
      >
        <div class="text-dim">
          <T id="pendingPayer" />
        </div>

        <DialogFooter class="justify-center">
          <Button
            start={<Icon path={check} class="size-6 stroke-2" />}
            loading={accept.isPending}
            onClick={() => accept.mutate()}
          >
            <T id="complete" />
          </Button>

          <Button
            variant="outline"
            start={<Icon path={xMark} class="size-6 stroke-2" />}
            loading={cancel.isPending}
            onClick={() => cancel.mutate()}
          >
            <T id="cancel" />
          </Button>
        </DialogFooter>
      </Show>
    </div>
  );
}

function createAcceptMutation(transactionId: () => string) {
  const t = T.useTranslate();
  const member = getAuthenticatedMember();
  const invalidate = useInvalidateApi();

  return createMutation(() => ({
    mutationFn: () => api.acceptTransaction({ path: { transactionId: transactionId() } }),
    async onSuccess() {
      await Promise.all([
        invalidate('getAuthenticatedMember'),
        invalidate('listTransactions', { query: { memberId: member()?.id } }),
      ]);

      notify.success(t('completeSuccess'));
    },
  }));
}

function createCancelMutation(transactionId: () => string) {
  const t = T.useTranslate();
  const member = getAuthenticatedMember();
  const invalidate = useInvalidateApi();

  return createMutation(() => ({
    mutationFn: () => api.cancelTransaction({ path: { transactionId: transactionId() } }),
    async onSuccess() {
      await Promise.all([
        invalidate('getAuthenticatedMember'),
        invalidate('listTransactions', { query: { memberId: member()?.id } }),
      ]);

      notify.success(t('cancelSuccess'));
    },
  }));
}

function TransactionStakeholdersMobile(props: { transaction: Transaction }) {
  return (
    // eslint-disable-next-line tailwindcss/no-arbitrary-value
    <div class="grid grid-cols-[repeat(3,auto)] gap-4 self-center lg:hidden">
      <div class="text-sm font-medium text-dim">
        <T id="details.payer" />
      </div>

      <div />

      <div class="text-sm font-medium text-dim">
        <T id="details.recipient" />
      </div>

      <MemberAvatarName member={props.transaction.payer} />

      <div>
        <Icon path={arrowRight} class="size-6" />
      </div>

      <div class="row items-center gap-2">
        <MemberAvatarName member={props.transaction.recipient} />
      </div>

      <div class="col-span-3 mt-8 text-center text-2xl font-semibold">
        <FormattedCurrencyAmount amount={props.transaction.amount} />
      </div>
    </div>
  );
}

function TransactionStakeholdersDesktop(props: { transaction: Transaction }) {
  return (
    // eslint-disable-next-line tailwindcss/no-arbitrary-value
    <div class="hidden grid-cols-[repeat(3,auto)] gap-x-6 gap-y-2 self-center lg:grid">
      <div class="text-sm font-medium text-dim">
        <T id="details.payer" />
      </div>

      <div />

      <div class="text-sm font-medium text-dim">
        <T id="details.recipient" />
      </div>

      <div class="row items-center gap-2">
        <MemberAvatarName member={props.transaction.payer} />
      </div>

      <div class="row items-center gap-2 text-xl font-semibold">
        <Icon path={minus} class="size-8" />
        <FormattedCurrencyAmount amount={props.transaction.amount} />
        <Icon path={arrowRight} class="size-8" />
      </div>

      <div class="row items-center gap-2">
        <MemberAvatarName member={props.transaction.recipient} />
      </div>
    </div>
  );
}
