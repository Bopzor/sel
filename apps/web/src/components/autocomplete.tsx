import { autoUpdate, flip, offset, shift, size } from '@floating-ui/dom';
import { createCombobox } from '@upop/solid';
import { useFloating } from 'solid-floating-ui';
import { Icon } from 'solid-heroicons';
import { chevronDown, chevronUp } from 'solid-heroicons/solid';
import { ComponentProps, JSX, Show, createSignal } from 'solid-js';

import { Dropdown } from './dropdown';
import { Input } from './input';
import { Spinner } from './spinner';

type AutocompleteProps<Item> = Pick<ComponentProps<typeof Input>, 'variant' | 'width' | 'name'> & {
  label?: JSX.Element;
  loading?: boolean;
  items: () => Item[];
  itemToString: (item: Item | null) => string;
  renderItem: (item: Item) => JSX.Element;
  renderNoItems?: (state: { inputValue: string }) => JSX.Element;
  inputValue?: () => string;
  onSearch: (query: string) => void;
  onItemSelected: (item: Item) => void;
};

export function Autocomplete<Item>(props: AutocompleteProps<Item>) {
  const combobox = createCombobox({
    items: props.items,
    itemToString: props.itemToString,
    inputValue: props.inputValue,
    onInputValueChange({ inputValue }) {
      props.onSearch(inputValue);
    },
    onSelectedItemChange({ selectedItem }) {
      if (selectedItem) {
        props.onItemSelected(selectedItem);
      }
    },
  });

  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);

  const position = useFloating(reference, floating, {
    placement: 'bottom',
    middleware: [
      offset(8),
      flip(),
      shift(),
      size({
        apply({ elements, rects }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <>
      <Input
        {...combobox.getInputProps()}
        fieldRef={setReference}
        variant={props.variant}
        width={props.width}
        name={props.name}
        end={
          <Show when={!props.loading} fallback={<Spinner class="size-4 text-dim" />}>
            <button type="button" {...combobox.getToggleButtonProps()}>
              <Show when={combobox.isOpen} fallback={<Icon path={chevronDown} class="size-5" />}>
                <Icon path={chevronUp} class="size-5" />
              </Show>
            </button>
          </Show>
        }
      />

      <Dropdown
        ref={setFloating}
        open={combobox.isOpen}
        position={position}
        items={props.items()}
        selectedItem={combobox.selectedItem ?? undefined}
        highlightedItem={props.items()[combobox.highlightedIndex]}
        renderItem={props.renderItem}
        renderNoItems={() => props.renderNoItems?.(combobox)}
        getMenuProps={combobox.getMenuProps}
        getItemProps={combobox.getItemProps}
      />
    </>
  );
}
