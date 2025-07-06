import { RequestStatus as RequestStatusEnum } from '@sel/shared';

import { TranslateRequestStatus } from 'src/intl/enums';

export function RequestStatus(props: { status: RequestStatusEnum }) {
  return (
    <span
      class="text-sm font-medium"
      classList={{
        'text-emerald-600': props.status === RequestStatusEnum.pending,
        'text-amber-600': props.status === RequestStatusEnum.canceled,
        'text-gray-600': props.status === RequestStatusEnum.fulfilled,
      }}
    >
      <TranslateRequestStatus value={props.status} />
    </span>
  );
}
