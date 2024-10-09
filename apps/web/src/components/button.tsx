import { debounce } from '@solid-primitives/scheduled';
import {
  ComponentProps,
  Show,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
} from 'solid-js';

import { Link } from './link';
import { Spinner } from './spinner';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button(props1: ButtonProps) {
  const props2 = mergeProps({ type: 'button', variant: 'primary' } satisfies ButtonProps, props1);
  const [props, buttonProps] = splitProps(props2, ['variant', 'loading', 'disabled', 'class', 'classList']);

  const [loading, setLoading] = createSignal(false);
  const setLoadingDebounced = debounce(setLoading, 250);

  createEffect(() => {
    if (props.loading) {
      setLoadingDebounced(true);
    } else {
      setLoading(false);
    }

    onCleanup(() => setLoadingDebounced.clear());
  });

  return (
    <button
      disabled={props.disabled ?? props.loading}
      class={props.class}
      classList={{
        button: true,
        'button-primary': props.variant === 'primary',
        'button-secondary': props.variant === 'secondary',
        ...props.classList,
      }}
      {...buttonProps}
    >
      {buttonProps.children}
      <Show when={loading()}>
        <Spinner class="size-4" />
      </Show>
    </button>
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function LinkButton(props1: LinkButtonProps) {
  const props = mergeProps({ variant: 'primary' } satisfies Omit<LinkButtonProps, 'href'>, props1);

  return (
    <Link
      {...props}
      unstyled
      classList={{
        button: true,
        'button-primary': props.variant === 'primary',
        'button-secondary': props.variant === 'secondary',
        ...props.classList,
      }}
    >
      {props.children}
      {props.loading && <Spinner class="size-4" />}
    </Link>
  );
}
