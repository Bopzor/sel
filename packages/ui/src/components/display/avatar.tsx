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
    /** full: a square with rounded corners, as wide as its container. */
    size?: 'sm' | 'md' | 'lg' | 'full';
    neutral?: boolean;
    placeholder?: React.ReactNode;
    children?: never;
  }
>;

export function Avatar({
  name,
  src,
  decorative = false,
  size = 'md',
  neutral = false,
  placeholder,
  className,
  ...props
}: AvatarProps) {
  return (
    <span
      {...props}
      className={avatarStyles({ size, neutral, className })}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
    >
      {src && <img src={src} alt="" className="size-full object-cover" />}
      {!src && (placeholder ?? initials(name))}
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
  'inline-flex shrink-0 items-center justify-center overflow-hidden uppercase select-none',
  {
    variants: {
      size: {
        sm: 'size-avatar-sm rounded-full text-caption',
        md: 'size-avatar-md rounded-full text-body-strong',
        lg: 'size-avatar-lg rounded-full text-title-2',
        full: 'aspect-square w-full rounded-lg align-top',
      },
      neutral: {
        false: 'bg-avatar text-avatar',
        true: 'bg-page text-subtle',
      },
    },
  },
);
