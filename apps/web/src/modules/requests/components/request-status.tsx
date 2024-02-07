import { RequestStatus as RequestStatusEnum } from '@sel/shared';
import { Show } from 'solid-js';

import { Translate } from '../../../intl/translate';

const TranslateRequestStatus = Translate.enum('requests.status');

type RequestStatusProps = {
  status?: RequestStatusEnum;
};

export const RequestStatus = (props: RequestStatusProps) => {
  return (
    <Show when={props.status}>
      <span
        class="font-semibold"
        classList={{
          'text-green-600 dark:text-green-400': props.status === RequestStatusEnum.pending,
          'text-yellow-600 dark:text-yellow-400': props.status === RequestStatusEnum.canceled,
        }}
      >
        <TranslateRequestStatus value={props.status ?? ''} />
      </span>
    </Show>
  );
};
