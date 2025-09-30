import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';
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
    <ul class="row gap-2 self-center rounded-lg border-1">
      <li class="inline-flex w-10 p-2 text-center">
        <button
          disabled={props.page === 1}
          onClick={() => props.onChange(props.page - 1)}
          class="disabled:opacity-30"
        >
          <Icon path={chevronLeft} class="size-6" />
        </button>
      </li>

      <For each={pages()}>
        {(page) => (
          <li
            class="w-10 p-2 text-center"
            classList={{
              'bg-gray-200/50': props.page === page,
            }}
          >
            <button
              disabled={props.page === page || page === '...'}
              onClick={() => {
                if (page !== '...') {
                  props.onChange(page);
                }
              }}
            >
              {page}
            </button>
          </li>
        )}
      </For>

      <li class="inline-flex w-10 p-2 text-center">
        <button
          onClick={() => props.onChange(props.page + 1)}
          disabled={props.page === props.pages}
          class="disabled:opacity-30"
        >
          <Icon path={chevronRight} class="size-6" />
        </button>
      </li>
    </ul>
  );
}
