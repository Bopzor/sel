import clsx from 'clsx';
import { cva } from 'cva';
import type { ComponentProps } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

type IconButtonProps = Override<
  ComponentProps<'button'>,
  {
    icon: IconName;
    /** Accessible name, also shown as a tooltip on hover. */
    label: string;
    variant?: 'ghost' | 'secondary' | 'primary';
    size?: 'sm' | 'md';
    children?: never;
  }
>;

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={iconButtonStyles({ variant: disabled ? 'disabled' : variant, size, className })}
    >
      <Icon name={icon} size={size === 'sm' ? 'md' : 'lg'} />
    </button>
  );
}

const interactive = clsx('cursor-pointer active:scale-98');

const iconButtonStyles = cva(
  'relative inline-flex shrink-0 items-center justify-center rounded-full border transition select-none',
  {
    variants: {
      variant: {
        ghost: [interactive, 'border-transparent bg-transparent text-default hover:bg-surface-hover'],
        secondary: [interactive, 'border-strong bg-surface text-default hover:bg-surface-hover'],
        primary: [
          interactive,
          'border-transparent bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active',
        ],
        disabled: 'cursor-not-allowed border-transparent bg-disabled text-disabled',
      },
      size: {
        md: 'size-control-md',
        // The hit area extends 2px around, to 44px.
        sm: 'size-control-sm after:absolute after:-inset-0.5',
      },
    },
  },
);
