import { autoUpdate, flip, offset, shift, size } from '@floating-ui/dom';
import { createSelect } from '@upop/solid';
import { useFloating } from 'solid-floating-ui';
import { Icon } from 'solid-heroicons';
import { chevronDown } from 'solid-heroicons/solid';
import { JSX, createSignal, splitProps } from 'solid-js';

import { createId } from 'src/utils/id';

import { Dropdown } from './dropdown';
import { FieldVariant, field } from './field';
import { FormControl } from './form-control';

type SelectProps<Item> = {
  items: Item[];
  renderItem: (item: Item) => JSX.Element;
  itemToString: (item: Item | null) => string;
  selectedItem?: () => Item | null;
  onItemSelected?: (item: Item) => void;
  label?: JSX.Element;
  error?: JSX.Element;
  helperText?: JSX.Element;
  variant?: FieldVariant;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  id?: string;
  classes?: Partial<Record<'root' | 'field', string>>;
};

export function Select<Item>(_props: SelectProps<Item>) {
  const id = createId(() => _props.id);

  const [formControlProps, fieldProps, selectProps, props] = splitProps(
    _props,
    ['label', 'error', 'helperText'],
    ['variant'],
    ['items', 'itemToString', 'selectedItem'],
  );

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
    ...selectProps,
    onSelectedItemChange({ selectedItem }) {
      if (selectedItem) {
        props.onItemSelected?.(selectedItem);
      }
    },
  });

  return (
    <>
      <FormControl id={id()} {...formControlProps} class={props.classes?.root}>
        <div
          {...fieldProps}
          ref={setReference}
          class={field({ ...fieldProps, class: props.classes?.field })}
          classList={{
            'opacity-40': props.disabled,
            'pointer-events-none': props.disabled || props.readOnly,
          }}
        >
          <div
            aria-disabled={props.disabled}
            class="row w-full cursor-pointer items-center justify-between px-4 py-3 outline-hidden"
            {...select.getToggleButtonProps()}
          >
            <div>
              <input
                readOnly
                tabIndex={-1}
                placeholder={props.placeholder}
                class="w-full cursor-pointer outline-hidden"
                classList={{ 'hidden!': select.selectedItem !== undefined }}
              />

              {select.selectedItem && props.renderItem(select.selectedItem)}
            </div>

            <Icon path={chevronDown} class="size-5 stroke-2" classList={{ '-scale-y-100': select.isOpen }} />
          </div>
        </div>
      </FormControl>

      <Dropdown
        ref={setFloating}
        open={select.isOpen}
        position={position}
        items={selectProps.items}
        selectedItem={select.selectedItem ?? undefined}
        highlightedItem={selectProps.items[select.highlightedIndex]}
        renderItem={props.renderItem}
        getMenuProps={select.getMenuProps}
        getItemProps={select.getItemProps}
      />
    </>
  );
}
