import { Member, Transaction } from '@sel/shared';

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

      <TransactionList member={props.member} transactions={props.transactions} />
    </>
  );
}
