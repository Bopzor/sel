import { Strategy } from '@floating-ui/dom';
import { ComponentProps, For, JSX, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

export type DropdownProps<Item> = {
  ref: (element: HTMLUListElement | null) => void;
  open: boolean;
  position: { strategy: Strategy; x?: number | null; y?: number | null };
  items: Item[];
  selectedItem?: Item;
  highlightedItem?: Item;
  renderItem: (item: Item) => JSX.Element;
  renderNoItems?: () => JSX.Element;
  getMenuProps: () => ComponentProps<'ul'>;
  getItemProps: (param: { item: Item; index: number }) => ComponentProps<'li'>;
};

export function Dropdown<Item>(props: DropdownProps<Item>) {
  return (
    <Portal>
      <Transition enterActiveClass="animate-in" exitActiveClass="animate-out">
        <Show when={props.open}>
          <ul
            ref={props.ref}
            class="z-20 col rounded-sm border bg-neutral px-2 py-3 shadow-sm fade-in fade-out"
            style={{
              position: props.position.strategy,
              top: `${props.position.y ?? 0}px`,
              left: `${props.position.x ?? 0}px`,
            }}
            // avoid triggering click outside handler (dialog)
            onClick={(event) => event.stopImmediatePropagation()}
            {...props.getMenuProps()}
          >
            <For
              each={props.items}
              fallback={props.renderNoItems ? <li>{props.renderNoItems()}</li> : undefined}
            >
              {(item, index) => (
                <li
                  class="cursor-pointer rounded-sm px-2 py-1"
                  classList={{
                    'font-semibold': item === props.selectedItem,
                    'bg-primary/75 text-white': item === props.highlightedItem,
                  }}
                  {...props.getItemProps({ item, index: index() })}
                >
                  {props.renderItem(item)}
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Transition>
    </Portal>
  );
}
