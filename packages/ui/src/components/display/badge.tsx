import { cva } from 'cva';
import type { ComponentProps } from 'react';

import { Icon, type IconName } from './icon';

type BadgeProps = ComponentProps<'span'> & {
  tone?: 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'accent';
  icon?: IconName;
};

export function Badge({ tone = 'neutral', icon, className, children, ...props }: BadgeProps) {
  return (
    <span {...props} className={badgeStyles({ tone, className })}>
      {icon && <Icon name={icon} size="sm" />}
      <span className="text-box-cap">{children}</span>
    </span>
  );
}

const badgeStyles = cva(
  'inline-flex h-7 items-center gap-1 rounded-full px-3 text-caption whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-sunken text-muted',
        primary: 'bg-primary-subtle text-primary',
        info: 'bg-info-subtle text-info',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-warning',
        danger: 'bg-danger-subtle text-danger',
        accent: 'bg-accent text-on-accent',
      },
    },
  },
);
