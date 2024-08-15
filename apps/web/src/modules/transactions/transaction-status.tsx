import { TransactionStatus as TransactionStatusEnum } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { check, xMark, exclamationTriangle } from 'solid-heroicons/solid';

import { Translate } from '../../intl/translate';

const TranslateTransactionStatus = Translate.enum('transactions.statuses');

export function TransactionStatus(props: { status: TransactionStatusEnum }) {
  return (
    <span
      class="inline-flex flex-row items-center gap-2"
      classList={{
        'text-yellow-600': props.status === TransactionStatusEnum.pending,
        'text-green-600': props.status === TransactionStatusEnum.completed,
        'text-dim': props.status === TransactionStatusEnum.canceled,
      }}
    >
      <Icon path={icons[props.status]} class="size-4" />
      <TranslateTransactionStatus value={props.status} />
    </span>
  );
}

const icons = {
  [TransactionStatusEnum.pending]: exclamationTriangle,
  [TransactionStatusEnum.completed]: check,
  [TransactionStatusEnum.canceled]: xMark,
};
