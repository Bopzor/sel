import { cva } from 'cva';
import type { ComponentProps, ReactNode } from 'react';

import { IconButton } from '../actions/icon-button';
import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

type Tone = 'info' | 'success' | 'warning' | 'danger';

export type AlertProps = Override<
  ComponentProps<'div'>,
  {
    tone?: Tone;
    title: ReactNode;
    /** Small buttons (size="sm"). */
    actions?: ReactNode;
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

export function Alert({
  tone = 'info',
  title,
  actions,
  onClose,
  closeLabel,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      {...props}
      role={tone === 'danger' ? 'alert' : 'status'}
      className={alertStyles({ tone, className })}
    >
      <Icon name={icons[tone]} size="md" className={iconStyles({ tone })} />

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-body-strong text-default">{title}</p>
        {children && <div className="text-body-sm text-default">{children}</div>}
        {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>

      {onClose && <IconButton icon="close" label={closeLabel} size="sm" onClick={onClose} className="-m-2" />}
    </div>
  );
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
