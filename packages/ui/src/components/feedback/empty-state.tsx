import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { Icon, type IconName } from '../display/icon';

export type EmptyStateProps = Omit<ComponentProps<'div'>, 'title'> & {
  icon: IconName;
  title: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ icon, title, action, className, children, ...props }: EmptyStateProps) {
  return (
    <div {...props} className={clsx('flex flex-col items-center gap-3 px-4 py-12 text-center', className)}>
      <Icon name={icon} className="text-subtle" />
      <p className="text-title-3 text-default">{title}</p>
      {children && <div className="max-w-content text-body text-muted">{children}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
