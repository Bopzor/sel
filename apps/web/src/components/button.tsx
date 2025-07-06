import clsx from 'clsx';
import { VariantProps, cva } from 'cva';
import { ComponentProps, JSX, splitProps } from 'solid-js';

import { Link } from './link';
import { Spinner } from './spinner';

type ButtonVariantProps = VariantProps<typeof button>;

type ButtonProps = ComponentProps<'button'> &
  ButtonVariantProps & {
    start?: JSX.Element;
    end?: JSX.Element;
    loading?: boolean;
  };

export function Button(_props: ButtonProps) {
  const [props, rest] = splitProps(_props, [
    'variant',
    'size',
    'start',
    'end',
    'disabled',
    'loading',
    'class',
  ]);

  const start = () => {
    const size = props.size ?? 'medium';

    if (props.loading) {
      return <Spinner class={clsx({ 'size-6': size === 'medium', 'size-4': size === 'small' })} />;
    }

    return props.start;
  };

  return (
    <button
      type="button"
      class={button({ ...props, class: props.class })}
      disabled={props.disabled ?? props.loading}
      {...rest}
    >
      {start()}
      {rest.children}
      {props.end}
    </button>
  );
}

type LinkButtonProps = ComponentProps<typeof Link> &
  ButtonVariantProps & {
    start?: JSX.Element;
  };

export function LinkButton(_props: LinkButtonProps) {
  const [props, rest] = splitProps(_props, ['variant', 'size', 'disabled', 'start', 'class']);

  return <Link class={button({ ...props, class: props.class })} {...rest} />;
}

const button = cva(
  [
    'inline-flex flex-row items-center justify-center gap-2',
    'rounded-lg border-2 transition hover:shadow-md',
    'font-medium whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        solid: 'border-emerald-600 bg-emerald-600 text-white',
        outline: 'bg-neutral text-dim',
        ghost: 'border-transparent text-dim hover:bg-inverted/5',
      },
      size: {
        small: 'px-2 py-0.5 text-sm',
        medium: 'px-4 py-1',
      },
      disabled: {
        true: 'pointer-events-none opacity-60',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'medium',
    },
  },
);
