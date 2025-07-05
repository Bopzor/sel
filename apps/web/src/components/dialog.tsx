import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { xMark } from 'solid-heroicons/solid';
import { JSX, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Motion, Presence } from 'solid-motionone';

import { createDismiss } from 'src/utils/event-handlers';

export function Dialog(props: { open: boolean; onClose: () => void; children: JSX.Element; class?: string }) {
  let ref!: HTMLDivElement;

  createDismiss(
    () => ref,
    () => props.open,
    () => props.onClose(),
  );

  return (
    <Portal mount={document.getElementById('root') ?? undefined}>
      <Backdrop show={props.open} class="col items-center justify-center p-4 ">
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
    <header class="row mb-4 items-start justify-between">
      <div class="mt-2 text-lg font-medium">{props.title}</div>
      <button onClick={() => props.onClose()}>
        <Icon path={xMark} class="size-6" />
      </button>
    </header>
  );
}

export function DialogFooter(props: { class?: string; children: JSX.Element }) {
  return (
    <footer class={clsx('row mt-6 flex-wrap items-center justify-end gap-4', props.class)}>
      {props.children}
    </footer>
  );
}

export function Backdrop(props: { show: boolean; class?: string; children: JSX.Element }) {
  return (
    <Presence exitBeforeEnter>
      <Show when={props.show}>
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, easing: 'ease-in-out' }}
          class={clsx(
            'fixed inset-0 z-20 backdrop-blur-sm backdrop-brightness-75 backdrop-grayscale',
            props.class,
          )}
        >
          {props.children}
        </Motion.div>
      </Show>
    </Presence>
  );
}
