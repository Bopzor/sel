import { Icon } from 'solid-heroicons';
import { xMark } from 'solid-heroicons/solid';
import { JSX } from 'solid-js';
import { Portal } from 'solid-js/web';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  width?: 1 | 2 | 3;
  children: JSX.Element;
};

export function Dialog(props: DialogProps) {
  return (
    <Portal mount={document.querySelector('#root') as HTMLElement}>
      <Overlay open={props.open} onClose={() => props.onClose()}>
        <dialog
          open={props.open}
          class="w-full rounded-lg bg-neutral p-4 md:mx-auto md:w-3/4 lg:w-2/3 xl:w-1/2"
          classList={{
            'max-w-xl': props.width === 1,
            'max-w-2xl': props.width === 2,
            'max-w-3xl': props.width === 3,
          }}
        >
          {props.children}
        </dialog>
      </Overlay>
    </Portal>
  );
}

export function DialogHeader(props: { title: JSX.Element; onClose: () => void }) {
  return (
    <div class="row items-start justify-between">
      <div class="mb-4 mt-2 text-lg font-medium">{props.title}</div>
      <button onClick={() => props.onClose()}>
        <Icon path={xMark} class="size-6" />
      </button>
    </div>
  );
}

function Overlay(props: { open: boolean; onClose: () => void; children: JSX.Element }) {
  return (
    <div
      class="col fixed inset-0 justify-center bg-inverted/25 backdrop-blur-sm dark:bg-inverted/10"
      classList={{ '!hidden': !props.open }}
      onClick={(event) => event.target === event.currentTarget && props.onClose()}
    >
      {props.children}
    </div>
  );
}
