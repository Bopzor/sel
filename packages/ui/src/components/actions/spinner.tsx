import clsx from 'clsx';

import { iconSizes, type IconSize } from '../display/icon';

type SpinnerProps = {
  size?: IconSize;
  className?: string;
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={clsx('shrink-0 animate-spin', iconSizes[size], className)}
    >
      <circle cx={12} cy={12} r={9} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={3} />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}
