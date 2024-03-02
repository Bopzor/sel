import { Strategy, autoUpdate, flip, offset, shift, size } from '@floating-ui/dom';
import clsx from 'clsx';
import { useFloating } from 'solid-floating-ui';
import { Icon } from 'solid-heroicons';
import { chevronDown } from 'solid-heroicons/solid';
import {
  ComponentProps,
  For,
  JSX,
  createEffect,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  splitProps,
} from 'solid-js';
import { Portal } from 'solid-js/web';

import { Field, FieldVariant, FieldWidth } from './field';

type SelectProps<Item> = {
  items: Item[];
  renderItem: (item: Item) => JSX.Element;
  itemToString: (item: Item) => string;
  selectedItem?: Item;
  onSelect?: (item: Item) => void;
  width?: FieldWidth;
  variant?: FieldVariant;
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

  const {
    //
    open,
    highlightedItem,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
  } = useSelect(props, floating);

  return (
    <>
      <Field {...fieldProps} ref={setReference} class={clsx(fieldProps.class, 'cursor-pointer')}>
        <div
          class="row w-full items-center justify-between px-4 py-3 outline-none"
          {...getToggleButtonProps()}
        >
          <div>
            <input
              readOnly
              tabIndex={-1}
              placeholder={props.placeholder}
              class="w-full cursor-pointer outline-none"
              classList={{ '!hidden': props.selectedItem !== undefined }}
            />

            {props.selectedItem && props.renderItem(props.selectedItem)}
          </div>

          <Icon path={chevronDown} class="size-5 stroke-2" classList={{ '-scale-y-100': open() }} />
        </div>
      </Field>

      <Portal>
        <Dropdown
          ref={setFloating}
          open={open()}
          position={position}
          items={props.items}
          selectedItem={props.selectedItem}
          highlightedItem={highlightedItem()}
          renderItem={props.renderItem}
          getMenuProps={getMenuProps}
          getItemProps={getItemProps}
        />
      </Portal>
    </>
  );
}

type DropdownProps<Item> = {
  ref: (element: HTMLUListElement | null) => void;
  open: boolean;
  position: { strategy: Strategy; x?: number | null; y?: number | null };
  items: Item[];
  selectedItem?: Item;
  highlightedItem?: Item;
  renderItem: (item: Item) => JSX.Element;
  getMenuProps: () => ComponentProps<'ul'>;
  getItemProps: (item: Item) => ComponentProps<'li'>;
};

function Dropdown<Item>(props: DropdownProps<Item>) {
  return (
    <ul
      ref={props.ref}
      class="col rounded bg-neutral px-2 py-3 shadow"
      classList={{ '!hidden': !props.open }}
      style={{
        position: props.position.strategy,
        top: `${props.position.y ?? 0}px`,
        left: `${props.position.x ?? 0}px`,
      }}
      {...props.getMenuProps()}
    >
      <For each={props.items}>
        {(item) => (
          <li
            class="cursor-pointer rounded px-2 py-1"
            classList={{
              'font-semibold': item === props.selectedItem,
              'bg-primary/75 text-white': item === props.highlightedItem,
            }}
            {...props.getItemProps(item)}
          >
            {props.renderItem(item)}
          </li>
        )}
      </For>
    </ul>
  );
}

function useSelect<Item>(props: SelectProps<Item>, floating: () => HTMLElement | null) {
  const [open, setOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal<number>();
  const id = createUniqueId();

  const highlightedItem = () => {
    const index = highlightedIndex();

    if (index !== undefined) {
      return props.items[index];
    }
  };

  const selectedIndex = () => {
    if (props.selectedItem) {
      return props.items.indexOf(props.selectedItem);
    }
  };

  createEffect(() => {
    if (open()) {
      setHighlightedIndex(selectedIndex() ?? 0);
    } else {
      setHighlightedIndex(undefined);
    }
  });

  createEffect(() => {
    if (open()) {
      onClickOutside(floating(), () => setOpen(false));
    }
  });

  const selectItem = (item: Item) => {
    setOpen(false);
    props.onSelect?.(item);
  };

  const onClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = () => {
    setOpen(!open());
  };

  const onKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    const key = event.key;
    const items = props.items;
    const highlightedItem: Item | undefined = items[highlightedIndex() ?? -1];

    if (!open()) {
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        setOpen(true);
      }

      return;
    }

    const highlightItemAt = (index: number) => {
      if (items[index]) {
        setHighlightedIndex(index);
      }
    };

    switch (key) {
      case 'ArrowUp':
        event?.preventDefault();
        highlightItemAt((highlightedIndex() ?? 1) - 1);
        break;

      case 'ArrowDown':
        event?.preventDefault();
        highlightItemAt((highlightedIndex() ?? -1) + 1);
        break;

      case 'Enter':
      case ' ':
        event?.preventDefault();
        selectItem(highlightedItem);
        break;
    }
  };

  const onBlur: JSX.FocusEventHandler<HTMLDivElement, FocusEvent> = (event) => {
    if (open()) {
      event.currentTarget.focus();
    }
  };

  return {
    open,
    highlightedItem,
    getToggleButtonProps: (): ComponentProps<'div'> => ({
      id,
      tabIndex: 0,
      role: 'combobox',
      'aria-haspopup': 'listbox',
      get 'aria-expanded'() {
        return open();
      },
      get 'aria-activedescendant'() {
        if (highlightedIndex() === undefined) {
          return undefined;
        }

        return `${id}-${highlightedIndex()}`;
      },
      onClick,
      onKeyDown,
      onBlur,
    }),
    getMenuProps: (): ComponentProps<'ul'> => ({
      onMouseOut: () => setHighlightedIndex(undefined),
    }),
    getItemProps: (item: Item): ComponentProps<'li'> => ({
      id: `${id}-${props.items.indexOf(item)}`,
      onClick: () => selectItem(item),
      onMouseOver: () => setHighlightedIndex(props.items.indexOf(item)),
    }),
  };
}

function onClickOutside(element: HTMLElement | null, handle: () => void) {
  function listener(event: MouseEvent) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    if (!hasAncestor(event.target, element)) {
      handle();
    }
  }

  document.addEventListener('click', listener);

  onCleanup(() => {
    document.removeEventListener('click', listener);
  });
}

function hasAncestor(target: HTMLElement | null, element: HTMLElement | null): boolean {
  if (!target || !element) {
    return false;
  }

  return target === element || hasAncestor(target.parentElement, element);
}
