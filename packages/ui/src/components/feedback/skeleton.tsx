import { cva } from 'cva';
import type { ComponentProps } from 'react';

import type { Override } from '../../utils';

export type SkeletonProps = Override<
  ComponentProps<'div'>,
  {
    children?: never;
    /** text: a line, as wide as its container. circle: an avatar placeholder, of the avatar sizes. rect: a block. */
    variant?: 'text' | 'circle' | 'rect';
    /** Size of a circle, matching the Avatar sizes. */
    size?: 'sm' | 'md' | 'lg';
  }
>;

export function Skeleton({ variant = 'text', size = 'md', className, ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden
      className={skeletonStyles({ variant, size: variant === 'circle' ? size : undefined, className })}
    />
  );
}

const skeletonStyles = cva('animate-pulse bg-skeleton motion-reduce:animate-none', {
  variants: {
    variant: {
      text: 'h-4 rounded-xs',
      circle: 'shrink-0 rounded-full',
      rect: 'rounded-md',
    },
    size: {
      sm: 'size-avatar-sm',
      md: 'size-avatar-md',
      lg: 'size-avatar-lg',
    },
  },
});
