import { createEffect, onCleanup, onMount } from 'solid-js';

export function createEventHandler<K extends keyof DocumentEventMap>(
  type: K,
  listener: (this: Document, event: DocumentEventMap[K]) => void,
) {
  onMount(() => document.addEventListener(type, listener));
  onCleanup(() => document.removeEventListener(type, listener));
}

export function createClickOutsideHandler(
  ref: () => HTMLElement | undefined,
  cb: (event: MouseEvent) => void,
) {
  createEventHandler('click', (event) => {
    const target = ref();

    if (event.target instanceof Node && !target?.contains(event.target)) {
      cb(event);
    }
  });
}

export function createDismiss(ref: () => HTMLElement | undefined, open: () => boolean, onClose: () => void) {
  createEffect(() => {
    if (open()) {
      createEventHandler('keydown', (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      });

      createClickOutsideHandler(ref, onClose);
    }
  });
}
