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
    <>
      <div class="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
        <div class="row justify-end md:order-2">{props.createTransactionButton}</div>
        <div class="items-center text-center text-lg font-medium md:col-start-2">
          <T id="balance" values={{ balance: <FormattedCurrencyAmount amount={props.member.balance} /> }} />
        </div>
      </div>

      <Show
        when={props.transactions?.length}
        fallback={
          <CardFallback class="max-w-none">
            {<T id="noTransactions" values={{ name: props.member.firstName }} />}
          </CardFallback>
        }
      >
        <TransactionList
          member={props.member}
          transactions={props.transactions}
          classes={{ root: 'border' }}
        />
      </Show>
    </>
  );
}
