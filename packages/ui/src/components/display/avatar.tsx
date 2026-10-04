import type { Override } from '@sel/utils';
import { cva } from 'cva';
import { type ComponentProps } from 'react';

type AvatarProps = Override<
  ComponentProps<'span'>,
  {
    name: string;
    src?: string;
    /** Hides the avatar from screen readers, when the name is written right next to it. */
    decorative?: boolean;
    size?: 'sm' | 'md' | 'lg';
    children?: never;
  }
>;

export function Avatar({ name, src, decorative = false, size = 'md', className, ...props }: AvatarProps) {
  return (
    <span
      {...props}
      className={avatarStyles({ size, className })}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials(name)}
    </span>
  );
}

function initials(name: string) {
  const words = name.trim().split(/\s+/);
  const first = words[0] ?? '';
  const last = words.length > 1 ? (words.at(-1) ?? '') : '';

  return (Array.from(first)[0] ?? '') + (Array.from(last)[0] ?? '');
}

const avatarStyles = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-avatar text-avatar uppercase select-none',
  {
    variants: {
      size: {
        sm: 'size-avatar-sm text-caption',
        md: 'size-avatar-md text-body-strong',
        lg: 'size-avatar-lg text-title-2',
      },
    },
  },
);
