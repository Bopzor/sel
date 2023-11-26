import { JSX, createComponent } from 'solid-js';
import { toast } from 'solid-toast';

import { UnexpectedErrorNotification } from './unexpected-error-notification';

export const notify = {
  success: (message: JSX.Element) => toast.success(message),
  error: (message: JSX.Element) => toast.error(message),
  unexpectedError: (error: Error) => {
    toast.error(() => createComponent(UnexpectedErrorNotification, { error }));
  },
};
