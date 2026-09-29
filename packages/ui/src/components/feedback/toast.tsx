import { cva } from 'cva';
import type { ComponentProps, ReactNode } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

type Tone = 'success' | 'info' | 'danger';

// The rendering of a toast only: showing, queuing, placing and dismissing toasts after a delay is left to the
// application's toast library, which renders this component.
export type ToastProps = Override<
  ComponentProps<'div'>,
  {
    /** Three to six words: "Request posted". */
    children: ReactNode;
    tone?: Tone;
    onClose?: () => void;
    /** Accessible name of the close button, in the application's language. */
    closeLabel?: string;
  }
>;

export function Toast({ tone = 'success', onClose, closeLabel, className, children, ...props }: ToastProps) {
  return (
    <div {...props} className={toastStyles({ tone, className })}>
      <Icon name={icons[tone]} size="md" />
      <p className="flex-1 py-3 text-toast">{children}</p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          title={closeLabel}
          className="flex size-touch-target shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-inverse-hover"
        >
          <Icon name="close" size="md" />
        </button>
      )}
    </div>
  );
}

const icons = {
  success: 'success',
  info: 'info',
  danger: 'error',
} satisfies Record<Tone, IconName>;

// The whole toast takes the tone's solid color, so that it can be told apart at a glance.
const toastStyles = cva('flex items-center gap-3 rounded-lg py-1 pr-1 pl-4 shadow-lg', {
  variants: {
    tone: {
      success: 'bg-success text-on-success',
      info: 'bg-info text-on-info',
      danger: 'bg-danger text-on-danger',
    },
  },
});
