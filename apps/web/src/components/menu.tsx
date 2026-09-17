import { autoUpdate, flip, offset, Placement, shift } from '@floating-ui/dom';
import { cva } from 'cva';
import { useClick, useDismiss, useFloating, useInteractions, useTransitionStyles } from 'solid-floating-ui';
import { Icon } from 'solid-heroicons';
import { chevronDown } from 'solid-heroicons/solid';
import { ComponentProps, JSX, Show, splitProps } from 'solid-js';

import { createTranslate } from 'src/intl/translate';
import { createMediaQuery } from 'src/utils/media-query';

import { Button } from './button';
import { Link } from './link';
import { Spinner } from './spinner';

const Translate = createTranslate('common');

export function Menu(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  placement?: Placement;
  children: JSX.Element;
}) {
  const floating = useFloating({
    get open() {
      return props.open;
    },
    onOpenChange: (open) => {
      props.setOpen(open);
    },
    get placement() {
      return props.placement;
    },
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const interactions = useInteractions([useClick(floating.context), useDismiss(floating.context)]);
  const transition = useTransitionStyles(floating.context, { duration: 120 });

  const isMobile = createMediaQuery('(max-width: 640px)');

  return (
    <>
      <Button
        {...interactions.getReferenceProps()}
        ref={(element) => floating.refs.setReference(element)}
        size={isMobile() ? 'small' : 'medium'}
        variant="outline"
      >
        <span class="max-sm:hidden">
          <Translate id="actions" />
        </span>
        <Icon path={chevronDown} class="size-6 sm:size-4" />
      </Button>

      <Show when={transition.isMounted}>
        <div
          {...interactions.getFloatingProps()}
          ref={(element) => floating.refs.setFloating(element)}
          class="z-popper col justify-stretch rounded-md bg-neutral p-2 floating shadow-lg"
          style={{ ...floating.floatingStyles, ...transition.styles }}
        >
          {props.children}
        </div>
      </Show>
    </>
  );
}

export function ButtonMenuItem(
  _props: ComponentProps<'button'> & { loading?: boolean; start?: JSX.Element },
) {
  const [props, rest] = splitProps(_props, ['loading', 'start', 'class', 'children']);

  return (
    <button type="button" class={menuItem({ class: props.class })} {...rest}>
      {props.loading ? <Spinner class="size-4" /> : props.start}
      {props.children}
    </button>
  );
}

export function LinkMenuItem(_props: ComponentProps<typeof Link> & { start?: JSX.Element }) {
  const [props, rest] = splitProps(_props, ['start', 'class', 'children']);

  return (
    <Link class={menuItem({ class: props.class })} {...rest}>
      {props.start}
      {props.children}
    </Link>
  );
}

const menuItem = cva(
  'inline-flex min-w-48 flex-row items-center gap-2 rounded-sm px-2 py-1 text-start hover:bg-gray-500/10',
);
