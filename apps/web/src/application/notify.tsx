import { JSX } from 'solid-js';
import { toast, ToastOptions } from 'solid-toast';

import { ApiError } from './api';

type NotificationType = 'success' | 'info' | 'error';

export const notify = (type: NotificationType, content: JSX.Element, opts?: ToastOptions) => {
  if (type === 'info') {
    toast(<p>{content}</p>, opts);
  } else {
    toast[type](<p>{content}</p>);
  }
};

notify.success = (content: JSX.Element, opts?: ToastOptions) => {
  notify('success', content, opts);
};

notify.info = (content: JSX.Element, opts?: ToastOptions) => {
  notify('info', content, opts);
};

notify.error = (param: Error | JSX.Element, opts?: ToastOptions) => {
  if (param instanceof Error) {
    if (ApiError.is(param)) {
      notify.error(`API Error ${param.status}: ${param.message}`, opts);
    } else {
      notify.error(param.message, opts);
    }
  } else {
    notify('error', param, opts);
  }
};
