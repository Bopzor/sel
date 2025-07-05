import { Member, Transaction } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';
import { For, Show } from 'solid-js';

import { getLetsConfig } from 'src/application/config';
import { FormattedCurrencyAmount, FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { MemberAvatarName } from './member-avatar-name';
import { TransactionStatus } from './transaction-status';

const T = createTranslate('components.transactionList');

export function TransactionList(props: {
  member?: Member;
  transactions?: Transaction[];
  showStatus?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}) {
  return (
    <>
      <TransactionListDesktop
        member={props.member}
        transactions={props.transactions}
        showStatus={props.showStatus}
        onTransactionClick={props.onTransactionClick}
      />

      <TransactionListMobile
        member={props.member}
        transactions={props.transactions}
        showStatus={props.showStatus}
        onTransactionClick={props.onTransactionClick}
      />
    </>
  );
}

function TransactionListDesktop(props: {
  member?: Member;
  transactions?: Transaction[];
  showStatus?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}) {
  const config = getLetsConfig();

  return (
    <table class="hidden w-full lg:table">
      <thead>
        <tr>
          <th>
            <T id="date" />
          </th>

          <th>
            <T id="payer" />
          </th>

          <th>
            <T id="recipient" />
          </th>

          <th class="capitalize">{config()?.currencyPlural}</th>

          <Show when={props.showStatus}>
            <th>
              <T id="status" />
            </th>
          </Show>

          <th>
            <T id="description" />
          </th>
        </tr>
      </thead>

      <tbody>
        <For each={props.transactions}>
          {(transaction) => (
            <tr
              onClick={() => props.onTransactionClick?.(transaction)}
              classList={{ 'cursor-pointer': props.onTransactionClick !== undefined }}
            >
              <td class="truncate">
                <FormattedDate date={transaction.date} />
              </td>

              <td>
                <MemberAvatarName link={false} classes={{ avatar: '!size-6' }} member={transaction.payer} />
              </td>

              <td>
                <MemberAvatarName
                  link={false}
                  classes={{ avatar: '!size-6' }}
                  member={transaction.recipient}
                />
              </td>

              <td class="truncate">
                <FormattedCurrencyAmount
                  amount={
                    props.member?.id === transaction.recipient.id ? transaction.amount : -transaction.amount
                  }
                />
              </td>

              <Show when={props.showStatus}>
                <td class="truncate">
                  <TransactionStatus status={transaction.status} />
                </td>
              </Show>

              <td>
                <div class="line-clamp-2">{transaction.description}</div>
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

function TransactionListMobile(props: {
  member?: Member;
  transactions?: Transaction[];
  showStatus?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}) {
  return (
    <ul class="divide-y lg:!hidden">
      <For each={props.transactions}>
        {(transaction) => (
          <li
            class="col gap-4 py-6"
            onClick={() => props.onTransactionClick?.(transaction)}
            classList={{ 'cursor-pointer': props.onTransactionClick !== undefined }}
          >
            <div class="row justify-between gap-4">
              <div class="text-sm text-dim">
                <FormattedDate date={transaction.date} />
              </div>

              <Show when={props.showStatus}>
                <div class="text-sm">
                  <TransactionStatus status={transaction.status} />
                </div>
              </Show>
            </div>

            <div class="row items-center gap-4">
              <MemberAvatarName member={transaction.payer} classes={{ avatar: '!size-6' }} />

              <div>
                <Icon path={arrowRight} class="size-4" />
              </div>

              <MemberAvatarName member={transaction.recipient} classes={{ avatar: '!size-6' }} />
            </div>

            <div>
              <T
                id="amountDescription"
                values={{
                  amount: (
                    <span class="font-medium">
                      <FormattedCurrencyAmount
                        amount={
                          props.member?.id === transaction.recipient.id
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
