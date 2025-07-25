import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { xMark } from 'solid-heroicons/solid';
import { JSX, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

import { createDismiss } from 'src/utils/event-handlers';

export function Dialog(props: {
  open: boolean;
  onClose: () => void;
  onClosed?: () => void;
  children: JSX.Element;
  class?: string;
}) {
  let ref!: HTMLDivElement;

  createDismiss(
    () => ref,
    () => props.open,
    () => props.onClose(),
  );

  return (
    <Portal mount={document.getElementById('root') ?? undefined}>
      <Backdrop show={props.open} onAfterExit={props.onClosed} class="col items-center justify-center p-4">
        <div
          ref={ref}
          role="dialog"
          class={clsx('w-full overflow-auto rounded-lg bg-neutral p-4', props.class)}
        >
          {props.children}
        </div>
      </Backdrop>
    </Portal>
  );
}

export function DialogHeader(props: { title: JSX.Element; onClose: () => void }) {
  return (
    <header class="mb-4 row items-start justify-between">
      <div class="mt-2 text-lg font-medium">{props.title}</div>
      <button onClick={() => props.onClose()}>
        <Icon path={xMark} class="size-6" />
      </button>
    </header>
  );
}

export function DialogFooter(props: { class?: string; children: JSX.Element }) {
  return (
    <footer class={clsx('mt-6 row flex-wrap items-center justify-end gap-4', props.class)}>
      {props.children}
    </footer>
  );
}

export function Backdrop(props: {
  show: boolean;
  onAfterExit?: () => void;
  class?: string;
  children: JSX.Element;
}) {
  return (
    <Transition
      enterActiveClass="animate-in"
      exitActiveClass="animate-out"
      onAfterExit={() => props.onAfterExit?.()}
    >
      <Show when={props.show}>
        <div
          class={clsx(
            'fixed inset-0 z-20 backdrop-blur-xs backdrop-brightness-75 backdrop-grayscale fade-in fade-out',
            props.class,
          )}
        >
          {props.children}
        </div>
      </Show>
    </Transition>
  );
}
