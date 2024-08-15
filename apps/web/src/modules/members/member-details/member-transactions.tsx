import { Member, Transaction } from '@sel/shared';
import { Show } from 'solid-js';

import { CurrencyAmount } from '../../../components/currency-amount';
import { Translate } from '../../../intl/translate';
import { TransactionList } from '../../transactions/transaction-list';

const T = Translate.prefix('members.transactions');

export function MemberTransactions(props: { member: Member; transactions?: Transaction[] }) {
  return (
    <>
      <div class="m-6 text-center text-lg font-medium">
        <T id="balance" values={{ balance: <CurrencyAmount amount={props.member.balance} /> }} />
      </div>

      <Show
        when={props.transactions?.length}
        fallback=<div class="card p-4">
          {<T id="noTransactions" values={{ name: props.member.firstName }} />}
        </div>
      >
        <TransactionList member={props.member} transactions={props.transactions} />
      </Show>
    </>
  );
}
