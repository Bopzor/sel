import { Combobox as ArkCombobox, ListCollection } from '@ark-ui/solid/combobox';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { check, chevronDown, xMark } from 'solid-heroicons/solid';
import { ComponentProps, For, JSX, mergeProps } from 'solid-js';
import { Portal } from 'solid-js/web';

import { Spinner } from './spinner';

export function Combobox<T>(_props: {
  collection: ListCollection<T>;
  variant?: 'solid' | 'outlined';
  label?: JSX.Element;
  name?: string;
  autofocus?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (item: T | null) => void;
  onClear?: () => void;
  onInputValueChange?: (value: string) => void;
  loading?: boolean;
  renderNoItems?: () => JSX.Element;
  classes?: Partial<Record<'root', string>>;
}) {
  const props = mergeProps({ variant: 'solid' } satisfies Partial<ComponentProps<typeof Combobox>>, _props);

  const getItem = (value: string) => {
    return props.collection.find(value);
  };

  const defaultInputValue = () => {
    const item = props.value ? getItem(props.value) : null;

    if (item) {
      return props.collection.stringifyItem(item) as string;
    }
  };

  return (
    <ArkCombobox.Root
      value={props.value ? [props.value] : undefined}
      onSelect={({ itemValue }) => props.onChange?.(getItem(itemValue))}
      defaultInputValue={defaultInputValue()}
      collection={props.collection}
      onInputValueChange={({ reason, inputValue }) => {
        if (reason === 'clear-trigger') {
          props.onClear?.();
        }

        if (reason === 'input-change') {
          props.onInputValueChange?.(inputValue);
        }
      }}
      class={props.classes?.root}
    >
      {props.label && <ArkCombobox.Label>{props.label}</ArkCombobox.Label>}

      <ArkCombobox.Control
        class={clsx('row h-12 min-h-12 rounded-lg border-2 focus-within:border-primary/50', {
          'border-transparent bg-neutral shadow-sm': props.variant === 'solid',
          'border-inverted/20': props.variant === 'outlined',
        })}
      >
        <ArkCombobox.Input
          name={props.name}
          autofocus={props.autofocus}
          placeholder={props.placeholder}
          class="w-full bg-transparent px-4 outline-none"
        />

        <ArkCombobox.ClearTrigger class={clsx(!props.value && 'hidden')}>
          <Icon path={xMark} class="size-4" />
        </ArkCombobox.ClearTrigger>

        <ArkCombobox.Trigger class="px-4 data-[state=open]:-scale-y-100">
          {props.loading ? <Spinner class="size-4" /> : <Icon path={chevronDown} class="size-4" />}
        </ArkCombobox.Trigger>
      </ArkCombobox.Control>

      <Portal>
        <ArkCombobox.Positioner>
          <ArkCombobox.Content class="rounded-lg bg-neutral p-4 shadow-sm">
            <ArkCombobox.Empty>{props.renderNoItems?.()}</ArkCombobox.Empty>

            <For each={props.collection.items}>
              {(item) => (
                <ArkCombobox.Item
                  item={item}
                  class="row cursor-pointer items-center gap-2 rounded-sm px-2 py-1 hover:bg-primary/5"
                >
                  <ArkCombobox.ItemText>{props.collection.stringifyItem(item)}</ArkCombobox.ItemText>
                  <ArkCombobox.ItemIndicator class="ms-auto">
                    <Icon path={check} class="size-4" />
                  </ArkCombobox.ItemIndicator>
                </ArkCombobox.Item>
              )}
            </For>
          </ArkCombobox.Content>
        </ArkCombobox.Positioner>
      </Portal>
    </ArkCombobox.Root>
  );
}
