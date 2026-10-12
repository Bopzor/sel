import { Portal } from '@ark-ui/react/portal';
import { Toast as ArkToast, Toaster as ArkToaster, createToaster } from '@ark-ui/react/toast';
import type { Override } from '@sel/utils';
import { cva } from 'cva';
import { useEffect, type ComponentProps, type ReactNode } from 'react';

import { IconButton } from '../actions/icon-button';
import { Icon } from '../display/icon';

type Tone = 'success' | 'info' | 'warning' | 'error';

type ToastProps = Override<
  ComponentProps<'div'>,
  {
    tone?: Tone;
    /** Three to six words: "Request posted". */
    children: ReactNode;
  }
> &
  (
    | { onClose?: undefined; closeLabel?: undefined }
    | {
        onClose: () => void;
        /** Accessible name of the close button, in the application's language. */
        closeLabel: string;
      }
  );

export function Toast({ tone = 'success', onClose, closeLabel, className, children, ...props }: ToastProps) {
  return (
    <div {...props} className={toastStyles({ tone, className })}>
      <Icon name={tone} size="md" className={iconStyles({ tone })} />
      <p className="flex-1 py-3 text-toast">{children}</p>
      {onClose && <IconButton icon="close" label={closeLabel} size="sm" onClick={onClose} />}
    </div>
  );
}

const toastStyles = cva('row items-center gap-3 rounded-lg border border-l-4 py-1 pr-1 pl-3 shadow-lg', {
  variants: {
    tone: {
      success: 'border-success-subtle bg-success-subtle',
      info: 'border-info-subtle bg-info-subtle',
      warning: 'border-warning-subtle bg-warning-subtle',
      error: 'border-danger-subtle bg-danger-subtle',
    },
  },
});

const iconStyles = cva('', {
  variants: {
    tone: {
      success: 'text-success',
      info: 'text-info',
      warning: 'text-warning',
      error: 'text-danger',
    },
  },
});

const toaster = createToaster({
  placement: 'top-end',
  max: 3,
  overlap: true,
  duration: 6000,
  removeDelay: 200, // duration-base
  offsets: '1rem',
});

export function showToast(message: string, tone: Tone = 'success') {
  toaster.create({ title: message, type: tone });
}

/** Renders the toasts shown with showToast. Mounted once, at the root of the application, above the router. */
export function Toaster({ closeLabel }: { closeLabel: string }) {
  useEffect(() => () => toaster.remove(), []);

  // In a portal: a modal dialog hides the rest of the page from screen readers, except the live regions that are
  // outside of it, like this one. Ark sets the group's z-index inline: the class needs !important.
  return (
    <Portal>
      <ArkToaster toaster={toaster} className="inset-s-4 z-toast!">
        {(toast) => (
          <ArkToast.Root className="toast">
            <Toast
              tone={toast.type as Tone}
              onClose={() => toaster.dismiss(toast.id)}
              closeLabel={closeLabel}
            >
              {toast.title}
            </Toast>
          </ArkToast.Root>
        )}
      </ArkToaster>
    </Portal>
  );
}
