import { JSX } from 'solid-js';

export enum NotificationType {
  success = 'success',
  info = 'info',
  error = 'error',
}

export interface NotificationsPort {
  notify(type: NotificationType, message: JSX.Element): void;
  error(error: Error): void;
}
