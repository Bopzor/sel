import { cva } from 'cva';
import { For, JSX } from 'solid-js';

export type TableColumn<T> = {
  header: () => JSX.Element;
  headerClass?: string;
  cell: (item: T) => JSX.Element;
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
                  <td class={td({ class: props.classes?.td?.(item, column) })}>{column.cell(item)}</td>
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
  'bg-inverted/10 px-3 py-2 text-start font-medium text-dim',
  'first-of-type:rounded-tl-lg last-of-type:rounded-tr-lg',
]);

const tr = cva('border-t hover:bg-primary/5');

const td = cva('px-3 py-2');
