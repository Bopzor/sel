import { autoUpdate, flip, offset, shift, size } from '@floating-ui/dom';
import { createSelect } from '@upop/solid';
import { useFloating } from 'solid-floating-ui';
import { Icon } from 'solid-heroicons';
import { chevronDown } from 'solid-heroicons/solid';
import { JSX, createSignal, mergeProps, splitProps } from 'solid-js';
import { Portal } from 'solid-js/web';

import { Dropdown } from './dropdown';
import { Field, FieldVariant, FieldWidth } from './field';

type SelectProps<Item> = {
  items: Item[];
  renderItem: (item: Item) => JSX.Element;
  itemToString: (item: Item | null) => string;
  selectedItem?: () => Item | null;
  onItemSelected?: (item: Item) => void;
  width?: FieldWidth;
  variant?: FieldVariant;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  class?: string;
};

export function Select<Item>(props1: SelectProps<Item>) {
  const props2 = mergeProps(
    { variant: 'solid', width: 'full' } satisfies Pick<SelectProps<Item>, 'variant' | 'width'>,
    props1,
  );

  const [fieldProps, props] = splitProps(props2, ['variant', 'width', 'class']);

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

  const select = createSelect({
    items: props.items,
    itemToString: props.itemToString,
    selectedItem: props.selectedItem,
    onSelectedItemChange({ selectedItem }) {
      if (selectedItem) {
        props.onItemSelected?.(selectedItem);
      }
    },
  });

  return (
    <>
      <Field
        {...fieldProps}
        ref={setReference}
        classList={{ 'opacity-40': props.disabled, 'pointer-events-none': props.disabled || props.readOnly }}
      >
        <div
          aria-disabled={props.disabled}
          class="row w-full cursor-pointer items-center justify-between px-4 py-3 outline-none"
          {...select.getToggleButtonProps()}
        >
          <div>
            <input
              readOnly
              tabIndex={-1}
              placeholder={props.placeholder}
              class="w-full cursor-pointer outline-none"
              classList={{ '!hidden': props.selectedItem !== undefined }}
            />

            {select.selectedItem && props.renderItem(select.selectedItem)}
          </div>

          <Icon path={chevronDown} class="size-5 stroke-2" classList={{ '-scale-y-100': select.isOpen }} />
        </div>
      </Field>

      <Portal>
        <Dropdown
          ref={setFloating}
          open={select.isOpen}
          position={position}
          items={props.items}
          selectedItem={select.selectedItem ?? undefined}
          highlightedItem={props.items[select.highlightedIndex]}
          renderItem={props.renderItem}
          getMenuProps={select.getMenuProps}
          getItemProps={select.getItemProps}
        />
      </Portal>
    </>
  );
}
