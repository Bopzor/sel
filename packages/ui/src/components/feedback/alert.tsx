import clsx from 'clsx';
import { cva } from 'cva';
import type { ComponentProps, ReactNode } from 'react';

import { IconButton } from '../actions/icon-button';
import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

type Tone = 'info' | 'success' | 'warning' | 'danger';

type AlertProps = Override<
  ComponentProps<'div'>,
  {
    tone?: Tone;
    /** An AlertTitle, an AlertDescription, AlertActions. */
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

export function Alert({ tone = 'info', onClose, closeLabel, className, children, ...props }: AlertProps) {
  return (
    <div
      {...props}
      role={tone === 'danger' ? 'alert' : 'status'}
      className={alertStyles({ tone, className })}
    >
      <Icon name={icons[tone]} size="md" className={iconStyles({ tone })} />

      <div className="flex flex-1 flex-col gap-1">{children}</div>

      {onClose && <IconButton icon="close" label={closeLabel} size="sm" onClick={onClose} className="-m-2" />}
    </div>
  );
}

/** A short sentence. */
export function AlertTitle({ className, ...props }: ComponentProps<'p'>) {
  return <p {...props} className={clsx('text-body-strong text-default', className)} />;
}

/** What happened, and what to do. */
export function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('text-body-sm text-default', className)} />;
}

/** Small buttons (size="sm"). */
export function AlertActions({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('mt-2 flex flex-wrap gap-2', className)} />;
}

const icons = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'error',
} satisfies Record<Tone, IconName>;

const alertStyles = cva('flex items-start gap-3 rounded-md border p-4', {
  variants: {
    tone: {
      info: 'border-info-subtle bg-info-subtle',
      success: 'border-success-subtle bg-success-subtle',
      warning: 'border-warning-subtle bg-warning-subtle',
      danger: 'border-danger-subtle bg-danger-subtle',
    },
  },
});

const iconStyles = cva('mt-0.5', {
  variants: {
    tone: {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
    },
  },
});
