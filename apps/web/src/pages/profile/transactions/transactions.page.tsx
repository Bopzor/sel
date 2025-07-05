import { AuthenticatedMember, Transaction } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { createQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { apiQuery, getAuthenticatedMember } from 'src/application/query';
import { Card } from 'src/components/card';
import { Dialog, DialogHeader } from 'src/components/dialog';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';
import { TransactionList } from 'src/components/transaction-list';
import { FormattedCurrencyAmount } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';
import { useSearchParam } from 'src/utils/search-param';

import { TransactionDetails } from './components/transaction-details';

const T = createTranslate('pages.profile.transactions');

export function TransactionsPage() {
  const member = getAuthenticatedMember();
  const [transactionId, setTransactionId] = useSearchParam('transactionId');

  const query = createQuery(() => apiQuery('listTransactions', { query: { memberId: member()?.id } }));

  const transaction = () => {
    return query.data?.find(hasProperty('id', transactionId() as string));
  };

  return (
    <>
      <Show when={member()} fallback={<TextSkeleton width={12} />}>
        {(member) => (
          <div class="font-medium text-dim">
            <T id="balance" values={{ balance: <FormattedCurrencyAmount amount={member().balance} /> }} />
          </div>
        )}
      </Show>

      <Show when={query.data} fallback={<Skeleton />}>
        {(transactions) => (
          <Show when={transactions().length > 0} fallback={<T id="empty" />}>
            <Card class="overflow-x-auto px-4 lg:p-0">
              <TransactionList
                showStatus
                member={member()}
                transactions={transactions()}
                onTransactionClick={(transaction) => setTransactionId(transaction.id)}
              />
            </Card>
          </Show>
        )}
      </Show>

      <Show when={member()}>
        {(member) => (
          <TransactionDetailsDialog
            open={transactionId() !== undefined}
            onClose={() => setTransactionId(undefined)}
            member={member()}
            transaction={transaction()}
          />
        )}
      </Show>
    </>
  );
}

function Skeleton() {
  return (
    <>
      <BoxSkeleton height={8} />
    </>
  );
}

function TransactionDetailsDialog(props: {
  open: boolean;
  onClose: () => void;
  member: AuthenticatedMember;
  transaction?: Transaction;
}) {
  const otherMember = (transaction: Transaction) => {
    return transaction.payer.id === props.member.id ? transaction.recipient : transaction.payer;
  };

  return (
    <Dialog open={props.open} onClose={() => props.onClose()} class="max-w-3xl">
      <Show when={props.transaction}>
        {(transaction) => (
          <>
            <DialogHeader
              title={<T id="details.title" values={{ name: otherMember(transaction()).firstName }} />}
              onClose={() => props.onClose()}
            />

            <TransactionDetails transaction={transaction()} />
          </>
        )}
      </Show>
    </Dialog>
  );
}
