import { TransactionStatus as TransactionStatusEnum } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { check, exclamationTriangle, xMark } from 'solid-heroicons/solid';

import { TranslateEnum } from 'src/intl/enums';

export function TransactionStatus(props: { status: TransactionStatusEnum }) {
  const icons = {
    [TransactionStatusEnum.pending]: exclamationTriangle,
    [TransactionStatusEnum.completed]: check,
    [TransactionStatusEnum.canceled]: xMark,
  };

  return (
    <span
      class="inline-flex flex-row items-center gap-2"
      classList={{
        'text-amber-600': props.status === TransactionStatusEnum.pending,
        'text-emerald-600': props.status === TransactionStatusEnum.completed,
        'text-dim': props.status === TransactionStatusEnum.canceled,
      }}
    >
      <div>
        <Icon path={icons[props.status]} class="size-4" />
      </div>

      <TranslateEnum enum="transactionStatus" value={props.status} />
    </span>
  );
}
