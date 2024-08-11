import { Member, Transaction } from '@sel/shared';
import { For } from 'solid-js';

import { CurrencyAmount } from '../../../components/currency-amount';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { FormattedDate } from '../../../intl/formatted';
import { Translate } from '../../../intl/translate';
import { getLetsConfig } from '../../../utils/lets-config';

const T = Translate.prefix('members.transactions');

export function MemberTransactions(props: { member: Member; transactions?: Transaction[] }) {
  const config = getLetsConfig();

  return (
    <div class="card p-4 md:p-8">
      <div class="text-center text-lg font-medium">
        <T id="balance" values={{ balance: <CurrencyAmount amount={props.member.balance} /> }} />
      </div>

      <hr class="my-4 md:my-8" />

      {/* eslint-disable-next-line tailwindcss/no-arbitrary-value*/}
      <div class="grid grid-cols-[repeat(4,auto)_1fr] gap-x-6 gap-y-2">
        <div class="my-1 font-medium">
          <T id="date" />
        </div>
        <div class="my-1 font-medium">
          <T id="payer" />
        </div>
        <div class="my-1 font-medium">
          <T id="recipient" />
        </div>
        <div class="my-1 font-medium capitalize">{config()?.currencyPlural}</div>
        <div class="my-1 font-medium">
          <T id="description" />
        </div>
        <For each={props.transactions}>
          {(transaction) => (
            <>
              <div>
                <FormattedDate date={transaction.date} />
              </div>
              <div class="row items-center gap-2">
                <MemberAvatarName
                  classes={{ avatar: '!size-6', name: 'font-normal' }}
                  member={transaction.payer}
                />
              </div>
              <div class="row items-center gap-2">
                <MemberAvatarName
                  classes={{ avatar: '!size-6', name: 'font-normal' }}
                  member={transaction.recipient}
                />
              </div>
              <div>
                <CurrencyAmount
                  amount={
                    props.member.id === transaction.recipient.id ? transaction.amount : -transaction.amount
                  }
                />
              </div>
              <div>{transaction.description}</div>
            </>
          )}
        </For>
      </div>
    </div>
  );
}
