import { Transaction, TransactionStatus as TransactionStatusEnum } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { createMutation, createQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { arrowRight, check, minus, xMark } from 'solid-heroicons/solid';
import { Show } from 'solid-js';

import { Button } from '../../../components/button';
import { CurrencyAmount } from '../../../components/currency-amount';
import { Dialog, DialogHeader } from '../../../components/dialog';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { useInvalidateApi } from '../../../infrastructure/api';
import { container } from '../../../infrastructure/container';
import { useSearchParam } from '../../../infrastructure/router/use-search-param';
import { FormattedDate } from '../../../intl/formatted';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { getAuthenticatedMember, getIsAuthenticatedMember } from '../../../utils/authenticated-member';
import { getLetsConfig } from '../../../utils/lets-config';
import { notify } from '../../../utils/notify';
import { fullName } from '../../members/full-name';
import { TransactionList } from '../../transactions/transaction-list';
import { TransactionStatus } from '../../transactions/transaction-status';

const T = Translate.prefix('profile.transactions');

export default function TransactionsPage() {
  const api = container.resolve(TOKENS.api);

  const authenticatedMember = getAuthenticatedMember();

  const query = createQuery(() => ({
    queryKey: ['listTransactions'],
    queryFn: () => api.listTransactions({ query: { memberId: authenticatedMember()?.id } }),
  }));

  const [transactionId, setTransactionId] = useSearchParam('transactionId');
  const transaction = () => query.data?.find(hasProperty('id', transactionId() as string));
  const onClose = () => setTransactionId(undefined);

  const otherMember = (transaction: Transaction) => {
    return transaction.payer.id === authenticatedMember()?.id ? transaction.recipient : transaction.payer;
  };

  return (
    <>
      <div class="font-medium text-dim">
        <T id="balance" values={{ balance: <CurrencyAmount amount={authenticatedMember()!.balance} /> }} />
      </div>

      <Show when={query.data?.length} fallback={<T id="noTransactions" />}>
        <TransactionList
          showStatus
          member={authenticatedMember()}
          transactions={query.data}
          onTransactionClick={(transaction) => setTransactionId(transaction.id)}
        />
      </Show>

      <Dialog open={transactionId() !== undefined} onClose={onClose}>
        <Show when={transaction()}>
          {(transaction) => (
            <>
              <DialogHeader
                title={<T id="details.title" values={{ name: fullName(otherMember(transaction())) }} />}
                onClose={onClose}
              />

              <TransactionDetails transaction={transaction()} onActionSuccess={() => onClose()} />
            </>
          )}
        </Show>
      </Dialog>
    </>
  );
}

function TransactionDetails(props: { transaction: Transaction; onActionSuccess: () => void }) {
  const api = container.resolve(TOKENS.api);
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const invalidate = useInvalidateApi();
  const t = T.useTranslation();
  const config = getLetsConfig();

  const accept = createMutation(() => ({
    mutationFn: () => api.acceptTransaction({ path: { transactionId: props.transaction.id } }),
    async onSuccess() {
      await invalidate(['getAuthenticatedMember'], ['listTransactions']);
      notify.success(t('completeSuccess'));
    },
  }));

  const cancel = createMutation(() => ({
    mutationFn: () => api.cancelTransaction({ path: { transactionId: props.transaction.id } }),
    async onSuccess() {
      await invalidate(['getAuthenticatedMember'], ['listTransactions']);
      notify.success(t('cancelSuccess'));
    },
  }));

  return (
    <div class="col gap-6">
      <div class="row gap-4">
        <FormattedDate date={props.transaction.date} dateStyle="long" timeStyle="short" />
        <TransactionStatus status={props.transaction.status} />
      </div>

      <div class="text-lg font-medium lg:text-center">{props.transaction.description}</div>

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
        <div class="col my-6 gap-4">
          <div class="text-dim">
            <T id="pendingPayer" />
          </div>
          <div class="row justify-center gap-4">
            <Button loading={accept.isPending} onClick={() => accept.mutate()}>
              <Icon path={check} class="size-6 stroke-2" />
              <T id="complete" />
            </Button>
            <Button variant="secondary" loading={cancel.isPending} onClick={() => cancel.mutate()}>
              <Icon path={xMark} class="size-6 stroke-2" />
              <T id="cancel" />
            </Button>
          </div>
        </div>
      </Show>
    </div>
  );
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

      <div class="row items-center gap-2">
        <MemberAvatarName member={props.transaction.payer} />
      </div>

      <div>
        <Icon path={arrowRight} class="size-6" />
      </div>

      <div class="row items-center gap-2">
        <MemberAvatarName member={props.transaction.recipient} />
      </div>

      <div class="col-span-3 mt-8 text-center text-2xl font-semibold">
        <CurrencyAmount amount={props.transaction.amount} />
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
        <CurrencyAmount amount={props.transaction.amount} />
        <Icon path={arrowRight} class="size-8" />
      </div>

      <div class="row items-center gap-2">
        <MemberAvatarName member={props.transaction.recipient} />
      </div>
    </div>
  );
}
