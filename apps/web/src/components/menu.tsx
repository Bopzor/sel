import { Placement, autoUpdate, flip, offset, shift } from '@floating-ui/dom';
import { cva } from 'cva';
import { useFloating } from 'solid-floating-ui';
import { Icon } from 'solid-heroicons';
import { ellipsisVertical } from 'solid-heroicons/solid';
import { ComponentProps, JSX, Show, createSignal, splitProps } from 'solid-js';
import { Motion, Presence } from 'solid-motionone';

import { createDismiss } from 'src/utils/event-handlers';

import { Link } from './link';
import { Spinner } from './spinner';

export function Menu(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  placement?: Placement;
  children: JSX.Element;
}) {
  const [reference, setReference] = createSignal<HTMLButtonElement>();
  const [floating, setFloating] = createSignal<HTMLDivElement>();

  const position = useFloating(reference, floating, {
    whileElementsMounted: autoUpdate,
    placement: props.placement,
    middleware: [offset(10), flip(), shift()],
  });

  createDismiss(
    floating,
    () => props.open,
    () => props.setOpen(false),
  );

  return (
    <>
      <button
        ref={setReference}
        type="button"
        onClick={() => props.setOpen(true)}
        class="rounded-md p-2 transition-colors hover:bg-gray-500/10"
      >
        <Icon path={ellipsisVertical} class="size-6" />
      </button>

      <Presence>
        <Show when={props.open}>
          <Motion.div
            ref={setFloating}
            class="col justify-stretch rounded-md bg-neutral p-2 shadow-lg"
            style={{
              position: position.strategy,
              top: `${position.y ?? 0}px`,
              left: `${position.x ?? 0}px`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {props.children}
          </Motion.div>
        </Show>
      </Presence>
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
