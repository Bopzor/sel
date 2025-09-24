import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';
import { createMemo, For } from 'solid-js';

type PaginationProps = {
  pages: number;
  page: number;
  onChange: (page: number) => void;
};

export function Pagination(props: PaginationProps) {
  const pages = createMemo<(number | '...')[]>(() => {
    const ellipsis = '...' as const;
    const maxPagesDisplayed = 5;

    const range = (lo: number, hi: number) => Array.from({ length: hi - lo }, (_, i) => i + lo);

    const start = Math.max(
      1,
      Math.min(props.page - Math.floor((maxPagesDisplayed - 3) / 2), props.pages - maxPagesDisplayed + 2),
    );
    const end = Math.min(
      props.pages,
      Math.max(props.page + Math.floor((maxPagesDisplayed - 2) / 2), maxPagesDisplayed - 1),
    );

    return [
      ...(start > 2 ? [1, ellipsis] : start > 1 ? [1] : []),
      ...range(start, end + 1),
      ...(end < props.pages - 1 ? [ellipsis, props.pages] : end < props.pages ? [props.pages] : []),
    ];
  });

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
