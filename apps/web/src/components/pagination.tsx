import clsx from 'clsx';
import { createMemo, For } from 'solid-js';

import { pagination } from '../utils/pagination';

type PaginationProps = {
  pages: number;
  page: number;
  onChange: (page: number) => void;
};

export function Pagination(props: PaginationProps) {
  const pages = createMemo<(number | '...')[]>(() => pagination({ pages: props.pages, current: props.page }));

  return (
    <ul class="row gap-1 self-center rounded sm:gap-2">
      <For each={pages()}>
        {(page) => (
          <li
            class={clsx(
              'inline-flex size-8 items-center justify-center rounded-full sm:size-10',
              'cursor-pointer rounded-full border border-transparent font-medium',
              'transition-all',
            )}
            classList={{
              'bg-primary/5 border-primary!': props.page === page,
            }}
          >
            <button
              class="p-1"
              disabled={props.page === page || page === '...'}
              onClick={() => {
                if (page !== '...') {
                  props.onChange(page);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }
              }}
            >
              {page}
            </button>
          </li>
        )}
      </For>
    </ul>
  );
}
