import { Member, Transaction } from '@sel/shared';
import { JSX, Show } from 'solid-js';

import { CardFallback } from 'src/components/card';
import { TransactionList } from 'src/components/transaction-list';
import { FormattedCurrencyAmount } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.members.details.transactions');

export function MemberTransactions(props: {
  member: Member;
  transactions?: Transaction[];
  createTransactionButton: JSX.Element;
}) {
  return (
    <div>
      {props.createTransactionButton}

      <div class="my-6 text-center text-lg font-medium">
        <T id="balance" values={{ balance: <FormattedCurrencyAmount amount={props.member.balance} /> }} />
      </div>

      <Show
        when={props.transactions?.length}
        fallback={
          <CardFallback>{<T id="noTransactions" values={{ name: props.member.firstName }} />}</CardFallback>
        }
      >
        <div class="overflow-x-auto rounded-sm border px-4 lg:px-0">
          <TransactionList member={props.member} transactions={props.transactions} />
        </div>
      </Show>
    </div>
  );
}
