import { createElement, useRef } from 'react';

/** A hidden file input, opened by a button of the application. */
export function useFileInput(onSelect: (files: File[]) => void) {
  const ref = useRef<HTMLInputElement>(null);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(Array.from(event.target.files ?? []));
    // Selecting the same file again still triggers a change.
    event.target.value = '';
  };

  return {
    // oxlint-disable-next-line react/refs
    input: createElement('input', { ref, type: 'file', multiple: true, hidden: true, onChange }),
    open: () => ref.current?.click(),
  };
}
