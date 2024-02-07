import { createSignal } from 'solid-js';

import { NotificationType } from '../infrastructure/notifications/notifications.port';
import { useTranslation } from '../intl/translate';

import { notify } from './notify';

type AsyncCallEffects<Result> = {
  onSuccess?: (result: Result) => void;
  onError?: (error: unknown) => void;
};

export const createAsyncCall = <Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  { onSuccess, onError }: AsyncCallEffects<Result> = {}
) => {
  const defaultErrorHandler = createDefaultErrorHandler();
  const [pending, setPending] = createSignal(false);

  const trigger = (...args: Args) => {
    setPending(true);

    void fn(...args)
      .then(onSuccess, onError ?? defaultErrorHandler)
      .finally(() => setPending(false));
  };

  return [trigger, pending] satisfies [unknown, unknown];
};

function createDefaultErrorHandler() {
  const translate = useTranslation();

  // todo: report
  return (error: unknown) => {
    if (error instanceof Error) {
      notify(NotificationType.error, translate('common.error.error', { message: error.message }));
    } else {
      notify(NotificationType.error, translate('common.error.unexpectedError'));
    }
  };
}
