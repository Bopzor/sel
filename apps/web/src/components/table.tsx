import { For, JSX } from 'solid-js';

type TableColumn<T> = {
  header: () => JSX.Element;
  cell: (item: T) => JSX.Element;
};

export function Table<T>(props: { columns: TableColumn<T>[]; items?: T[]; class?: string }) {
  return (
    <table class={props.class}>
      <thead>
        <tr>
          <For each={props.columns}>
            {(column) => (
              <th class="bg-inverted/10 px-3 py-2 text-start font-medium text-dim first-of-type:rounded-tl-lg last-of-type:rounded-tr-lg">
                {column.header()}
              </th>
            )}
          </For>
        </tr>
      </thead>

      <tbody>
        <For each={props.items}>
          {(item) => (
            <tr class="border-t hover:bg-primary/5">
              <For each={props.columns}>{(column) => <td class="px-3 py-2">{column.cell(item)}</td>}</For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
