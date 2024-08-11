import { Member, Transaction } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';
import { For } from 'solid-js';

import { CurrencyAmount } from '../../../components/currency-amount';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { FormattedDate } from '../../../intl/formatted';
import { Translate } from '../../../intl/translate';
import { getLetsConfig } from '../../../utils/lets-config';

const T = Translate.prefix('members.transactions');

export function MemberTransactions(props: { member: Member; transactions?: Transaction[] }) {
  return (
    <div class="card p-4 md:p-8">
      <div class="text-center text-lg font-medium">
        <T id="balance" values={{ balance: <CurrencyAmount amount={props.member.balance} /> }} />
      </div>

      <hr class="my-4 md:my-8" />

      <TransactionListDesktop member={props.member} transactions={props.transactions} />
      <TransactionListMobile member={props.member} transactions={props.transactions} />
    </div>
  );
}

function TransactionListDesktop(props: { member: Member; transactions?: Transaction[] }) {
  const config = getLetsConfig();

  return (
    /* eslint-disable-next-line tailwindcss/no-arbitrary-value*/
    <div class="hidden grid-cols-[repeat(4,auto)_1fr] items-start gap-x-6 gap-y-2 lg:grid">
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

            <div class="line-clamp-2">{transaction.description}</div>
          </>
        )}
      </For>
    </div>
  );
}

function TransactionListMobile(props: { member: Member; transactions?: Transaction[] }) {
  return (
    <ul class="col gap-4 lg:!hidden">
      <For each={props.transactions}>
        {(transaction) => (
          <li class="col gap-2">
            <div class="text-sm text-dim">
              <FormattedDate date={transaction.date} />
            </div>

            <div class="row items-center gap-4">
              <div class="row items-center gap-2">
                <MemberAvatarName
                  member={transaction.payer}
                  classes={{ avatar: '!size-6', name: 'font-normal' }}
                />
              </div>

              <div>
                <Icon path={arrowRight} class="size-4" />
              </div>

              <div class="row items-center gap-2">
                <MemberAvatarName
                  member={transaction.recipient}
                  classes={{ avatar: '!size-6', name: 'font-normal' }}
                />
              </div>
            </div>

            <div>
              <T
                id="amountDescription"
                values={{
                  amount: (
                    <span class="font-medium">
                      <CurrencyAmount
                        amount={
                          props.member.id === transaction.recipient.id
                            ? transaction.amount
                            : -transaction.amount
                        }
                      />
                    </span>
                  ),
                  description: <span>{transaction.description}</span>,
                }}
              />
            </div>
          </li>
        )}
      </For>
    </ul>
  );
}
