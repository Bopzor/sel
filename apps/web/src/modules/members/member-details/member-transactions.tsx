import { Member } from '@sel/shared';

import { CurrencyAmount } from '../../../components/currency-amount';
import { Translate } from '../../../intl/translate';

const T = Translate.prefix('members.transactions');

export function MemberTransactions(props: { member: Member }) {
  return (
    <div class="card p-4 md:p-8">
      <div class="text-center text-lg font-medium">
        <T id="balance" values={{ balance: <CurrencyAmount amount={props.member.balance} /> }} />
      </div>
    </div>
  );
}
