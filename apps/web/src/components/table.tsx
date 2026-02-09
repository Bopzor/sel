import clsx from 'clsx';
import { cva } from 'cva';
import { Icon } from 'solid-heroicons';
import { arrowDown } from 'solid-heroicons/solid';
import { For, JSX, Show } from 'solid-js';

export type TableColumn<T> = {
  header: () => JSX.Element;
  headerClass?: string;
  cell: (item: T) => JSX.Element;
  cellClass?: string;
};

export function Table<T>(props: {
  columns: TableColumn<T>[];
  items?: T[];
  onRowClick?: (item: T) => void;
  classes?: Partial<{
    root: string;
    td: (item: T, column: TableColumn<T>) => string;
  }>;
}) {
  return (
    <table class={props.classes?.root}>
      <thead>
        <tr>
          <For each={props.columns}>
            {(column) => <th class={th({ class: column.headerClass })}>{column.header()}</th>}
          </For>
        </tr>
      </thead>

      <tbody>
        <For each={props.items}>
          {(item) => (
            <tr
              onClick={() => props.onRowClick?.(item)}
              class={tr()}
              classList={{ 'cursor-pointer': props.onRowClick !== undefined }}
            >
              <For each={props.columns}>
                {(column) => (
                  <td class={td({ class: clsx(props.classes?.td?.(item, column), column.cellClass) })}>
                    {column.cell(item)}
                  </td>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

const th = cva([
  'border-b-2 px-3 py-2 text-start font-semibold text-dim',
  'first-of-type:rounded-tl-md last-of-type:rounded-tr-md',
]);

const tr = cva('border-t hover:bg-primary/5');

const td = cva('px-3 py-2');

export function TableHeader(props: {
  sorting?: boolean;
  order?: 'asc' | 'desc';
  onSort?: () => void;
  children: JSX.Element;
}) {
  return (
    <Show when={props.onSort} fallback={props.children}>
      <button type="button" onClick={() => props.onSort?.()} class="row items-center gap-2">
        {props.children}
        <div classList={{ invisible: !props.sorting }}>
          <Icon
            path={arrowDown}
            class="size-4 stroke-2"
            classList={{ '-scale-y-100': props.order === 'desc' }}
          />
        </div>
      </button>
    </Show>
  );
}
