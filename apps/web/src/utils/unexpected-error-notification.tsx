import { Component } from 'solid-js';

import { FetchResult } from '../fetcher';
import { Translate } from '../intl/translate';

const T = Translate.prefix('common.error');

type UnexpectedErrorNotificationProps = {
  error: Error;
};

export const UnexpectedErrorNotification: Component<UnexpectedErrorNotificationProps> = (props) => {
  return (
    <div>
      <p class="my-1 font-semibold">
        <T id="unexpectedError" />
      </p>

      {props.error instanceof FetchResult && (
        <p class="my-1 text-sm font-medium text-dim">
          {props.error.status} {props.error.response.statusText}
        </p>
      )}

      {props.error.message && (
        <p class="my-1 text-sm font-medium text-dim">
          <T id="errorMessage" values={{ message: props.error.message }} />
        </p>
      )}
    </div>
  );
};
