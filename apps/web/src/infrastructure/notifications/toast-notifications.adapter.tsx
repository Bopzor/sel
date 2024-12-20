import { injectableClass } from 'ditox';
import { JSX, Show } from 'solid-js';
import { toast, Toaster } from 'solid-toast';

import { Translate } from '../../intl/translate';
import { ApiError } from '../api';

import { NotificationsPort, NotificationType } from './notifications.port';

const T = Translate.prefix('common.error');

export class ToastNotificationsAdapter implements NotificationsPort {
  static inject = injectableClass(this);

  notify(type: NotificationType, message: JSX.Element): void {
    if (type === NotificationType.info) {
      toast(<p>{message}</p>);
    } else {
      toast[type](<p>{message}</p>);
    }
  }

  error(error: Error): void {
    toast.error(
      <div>
        <p class="my-1 font-semibold">
          <T id="unexpectedError" />
        </p>

        <Show when={ApiError.is(error) ? error : false}>
          {(error) => (
            <p class="my-1 text-sm font-medium text-dim">
              {error().status} {error().response.statusText}
            </p>
          )}
        </Show>

        {error.message && (
          <p class="my-1 text-sm font-medium text-dim">
            <T id="errorMessage" values={{ message: error.message }} />
          </p>
        )}
      </div>,
    );
  }
}

export const NotificationsContainer = () => (
  <Toaster toastOptions={{ duration: 5 * 1000, className: '!max-w-xl' }} />
);
