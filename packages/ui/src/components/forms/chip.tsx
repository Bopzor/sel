import clsx from 'clsx';
import type { ComponentProps, MouseEvent } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

export type ChipProps = Override<
  ComponentProps<'button'>,
  {
    disabled?: never;
    selected?: boolean;
    onChange?: (selected: boolean) => void;
    /** Shown when the chip is not selected; a selected chip shows a check mark. */
    icon?: IconName;
  }
>;

export function Chip({
  selected = false,
  onChange,
  icon,
  className,
  children,
  onClick,
  ...props
}: ChipProps) {
  const shownIcon = selected ? 'check' : icon;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    onChange?.(!selected);
  };

  return (
    <button
      type="button"
      {...props}
      aria-pressed={selected}
      onClick={handleClick}
      className={clsx(
        // The hit area extends 2px above and below, to 44px.
        'relative inline-flex h-control-sm cursor-pointer items-center gap-2 rounded-full border px-4 text-button-sm transition select-none after:absolute after:inset-x-0 after:-inset-y-0.5',
        selected
          ? 'border-primary bg-primary-subtle text-primary hover:bg-primary-subtle-hover'
          : 'border-strong bg-surface text-default hover:bg-surface-hover',
        className,
      )}
    >
      {shownIcon && <Icon name={shownIcon} size="sm" />}
      {children}
    </button>
  );
}
