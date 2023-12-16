import { JSX } from 'solid-js';

import { container } from '../infrastructure/container';
import { NotificationType } from '../infrastructure/notifications/notifications.port';
import { TOKENS } from '../tokens';

export const notify = (type: NotificationType, message: JSX.Element) => {
  const notifications = container.resolve(TOKENS.notifications);
  notifications.notify(type, message);
};

notify.success = (message: JSX.Element) => {
  notify(NotificationType.success, message);
};

notify.info = (message: JSX.Element) => {
  notify(NotificationType.info, message);
};

notify.error = (message: JSX.Element) => {
  notify(NotificationType.error, message);
};
