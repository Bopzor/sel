import { autoUpdate, flip, offset, shift, size } from '@floating-ui/dom';
import { createCombobox } from '@upop/solid';
import clsx from 'clsx';
import { useFloating } from 'solid-floating-ui';
import { Icon } from 'solid-heroicons';
import { chevronDown } from 'solid-heroicons/solid';
import { ComponentProps, JSX, Show, createSignal, splitProps } from 'solid-js';

import { Dropdown } from './dropdown';
import { Input } from './input';
import { Spinner } from './spinner';

const forwardedInputProps = [
  'ref',
  'name',
  'label',
  'placeholder',
  'error',
  'variant',
  'width',
  'autofocus',
  'onBlur',
  'classes',
] satisfies Array<keyof ComponentProps<typeof Input>>;

type AutocompleteProps<Item> = Pick<ComponentProps<typeof Input>, (typeof forwardedInputProps)[number]> & {
  label?: JSX.Element;
  placeholder?: string;
  loading?: boolean;
  items: Item[];
  itemToString: (item: Item | null) => string;
  renderItem: (item: Item) => JSX.Element;
  renderNoItems?: (state: { inputValue: string }) => JSX.Element;
  inputValue?: () => string;
  selectedItem?: () => Item | null;
  onSearch: (query: string) => void;
  onItemSelected: (item: Item) => void;
};

export function Autocomplete<Item>(props: AutocompleteProps<Item>) {
  const [inputProps, comboboxProps] = splitProps(props, forwardedInputProps, [
    'items',
    'itemToString',
    'inputValue',
    'selectedItem',
  ]);

  const combobox = createCombobox({
    ...comboboxProps,
    items: () => comboboxProps.items,
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
        {...inputProps}
        fieldRef={setReference}
        end={
          <button type="button" {...combobox.getToggleButtonProps()}>
            <Show when={!props.loading} fallback={<Spinner class="size-4 text-dim" />}>
              <Icon path={chevronDown} class={clsx('size-5', combobox.isOpen && '-scale-y-100')} />
            </Show>
          </button>
        }
      />

      <Dropdown
        ref={setFloating}
        open={combobox.isOpen}
        position={position}
        items={props.items}
        selectedItem={combobox.selectedItem ?? undefined}
        highlightedItem={props.items[combobox.highlightedIndex]}
        renderItem={props.renderItem}
        renderNoItems={() => props.renderNoItems?.(combobox)}
        getMenuProps={combobox.getMenuProps}
        getItemProps={combobox.getItemProps}
      />
    </>
  );
}
