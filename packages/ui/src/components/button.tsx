import clsx from 'clsx';
import { cva } from 'cva';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';

import { Icon, type IconName } from './icon';
import { Spinner } from './spinner';

type ButtonAppearance = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconEnd?: IconName;
};

export type ButtonProps = ComponentProps<'button'> & ButtonAppearance & { loading?: boolean };

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  loading = false,
  disabled = false,
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  // Rendered with aria-disabled rather than the native attribute: the button stays focusable, so that screen
  // readers announce it and the focus is not lost when loading starts. Clicks are blocked in handleClick.
  const blocked = disabled || loading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (blocked) {
      event.preventDefault();
    } else {
      onClick?.(event);
    }
  };

  return (
    <button
      type="button"
      {...props}
      className={buttonStyles({ variant: blocked ? 'disabled' : variant, size, className })}
      aria-disabled={blocked || undefined}
      data-loading={loading || undefined}
      onClick={handleClick}
    >
      <ButtonContent size={size} icon={icon} iconEnd={iconEnd} loading={loading}>
        {children}
      </ButtonContent>
    </button>
  );
}

export type LinkButtonProps = ComponentProps<'a'> & ButtonAppearance;

/** A link that looks like a button, for an action that navigates. A link cannot be disabled or loading. */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a {...props} className={buttonStyles({ variant, size, className })}>
      <ButtonContent size={size} icon={icon} iconEnd={iconEnd}>
        {children}
      </ButtonContent>
    </a>
  );
}

type ButtonContentProps = Pick<ButtonAppearance, 'icon' | 'iconEnd'> & {
  size: NonNullable<ButtonAppearance['size']>;
  loading?: boolean;
  children: ReactNode;
};

function ButtonContent({ size, icon, iconEnd, loading = false, children }: ButtonContentProps) {
  const iconSize = size === 'sm' ? 'sm' : 'md';

  return (
    <>
      {loading ? <Spinner size={iconSize} /> : icon && <Icon name={icon} size={iconSize} />}
      <span>{children}</span>
      {iconEnd && <Icon name={iconEnd} size={iconSize} />}
    </>
  );
}

const interactive = clsx('cursor-pointer active:scale-98');

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-md border text-center no-underline transition select-none',
  {
    variants: {
      variant: {
        primary: [
          interactive,
          'border-transparent bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active',
        ],
        secondary: [interactive, 'border-strong bg-surface text-default hover:bg-surface-hover'],
        ghost: [interactive, 'border-transparent bg-transparent text-primary hover:bg-primary-subtle'],
        danger: [interactive, 'border-transparent bg-danger text-on-danger hover:bg-danger-hover'],
        disabled: 'cursor-not-allowed border-transparent bg-disabled text-disabled data-loading:cursor-progress',
      },
      size: {
        sm: 'min-h-control-sm px-4 text-button-sm',
        md: 'min-h-control-md px-5 text-button',
        lg: 'min-h-control-lg px-6 text-button',
      },
    },
  },
);
