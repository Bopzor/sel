import { NotificationType } from '../infrastructure/notifications/notifications.port';
import { useTranslation } from '../intl/translate';

import { notify } from './notify';

export function createErrorHandler() {
  const translate = useTranslation();

  // todo: report
  return (error: unknown) => {
    console.error(error);

    if (error instanceof Error) {
      notify(NotificationType.error, translate('common.error.error', { message: error.message }));
    } else {
      notify(NotificationType.error, translate('common.error.unexpectedError'));
    }
  };
}
