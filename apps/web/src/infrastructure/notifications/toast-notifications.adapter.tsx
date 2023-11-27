import { injectableClass } from 'ditox';
import { JSX } from 'solid-js';
import { toast } from 'solid-toast';

import { FetchResult } from '../../fetcher';
import { Translate } from '../../intl/translate';

import { NotificationsPort, NotificationType } from './notifications.port';

const T = Translate.prefix('common.error');

export class ToastNotificationsAdapter implements NotificationsPort {
  static inject = injectableClass(this);

  notify(type: NotificationType, message: JSX.Element): void {
    toast[type](message);
  }

  error(error: Error): void {
    toast.error(
      <div>
        <p class="my-1 font-semibold">
          <T id="unexpectedError" />
        </p>

        {error instanceof FetchResult && (
          <p class="my-1 text-sm font-medium text-dim">
            {error.status} {error.response.statusText}
          </p>
        )}

        {error.message && (
          <p class="my-1 text-sm font-medium text-dim">
            <T id="errorMessage" values={{ message: error.message }} />
          </p>
        )}
      </div>
    );
  }
}
