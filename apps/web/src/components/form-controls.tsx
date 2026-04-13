import {
  Combobox as ArkCombobox,
  ComboboxInputValueChangeDetails,
  ListCollection,
} from '@ark-ui/solid/combobox';
import { Field as ArkField } from '@ark-ui/solid/field';
import { Select as ArkSelect } from '@ark-ui/solid/select';
import { Icon } from 'solid-heroicons';
import { check, chevronDown, xMark } from 'solid-heroicons/solid';
import { ComponentProps, For, JSX, Show, splitProps } from 'solid-js';

import { Spinner } from './spinner';

export type FieldVariant = 'solid' | 'outlined';

type Classes<Part extends string> = Partial<Record<Part, string>>;

type FieldProps = {
  label?: JSX.Element;
  helperText?: JSX.Element;
  error?: JSX.Element;
};

export function Field(
  props: FieldProps & { name?: string; classes?: Classes<'field'>; children: JSX.Element },
) {
  return (
    <ArkField.Root invalid={Boolean(props.error)} class={props.classes?.field}>
      {props.label && <ArkField.Label for={props.name}>{props.label}</ArkField.Label>}
      {props.children}
      {props.helperText && <ArkField.HelperText>{props.helperText}</ArkField.HelperText>}
      {props.error && <ArkField.ErrorText>{props.error}</ArkField.ErrorText>}
    </ArkField.Root>
  );
}

Field.Context = ArkField.Context;

export function Input(
  _props: FieldProps & {
    variant?: FieldVariant;
    start?: JSX.Element;
    end?: JSX.Element;
    classes?: Classes<'field' | 'shell' | 'input'>;
  } & ComponentProps<'input'>,
) {
  const [props, fieldProps, inputProps] = splitProps(
    _props,
    ['variant', 'start', 'end', 'classes'],
    ['label', 'helperText', 'error'],
  );

  return (
    <Field {...fieldProps} name={inputProps.name} classes={props.classes}>
      <div
        data-scope="field"
        data-part="input-shell"
        data-variant={props.variant ?? 'solid'}
        class={props.classes?.shell}
      >
        {props.start && <div data-part="start">{props.start}</div>}
        <ArkField.Input {...inputProps} id={inputProps.name} class={props.classes?.input} />
        {props.end && <div data-part="end">{props.end}</div>}
      </div>
    </Field>
  );
}

export function Textarea(
  _props: FieldProps & {
    variant?: FieldVariant;
    autoresize?: boolean;
    classes?: Classes<'field' | 'textarea'>;
  } & ComponentProps<'textarea'>,
) {
  const [props, fieldProps, textareaProps] = splitProps(
    _props,
    ['variant', 'classes'],
    ['label', 'helperText', 'error'],
  );

  return (
    <Field {...fieldProps} name={textareaProps.name} classes={props.classes}>
      <ArkField.Textarea
        {...textareaProps}
        id={textareaProps.name}
        class={props.classes?.textarea}
        data-variant={props.variant ?? 'solid'}
      />
    </Field>
  );
}

export function Select<Item>(
  _props: FieldProps & {
    collection: ListCollection<Item>;
    renderItem: (item: Item) => JSX.Element;
    variant?: FieldVariant;
    placeholder?: string;
    value?: string;
    onValueChange?: (value?: string) => void;
    readOnly?: boolean;
    classes?: Classes<'field'>;
  } & Omit<ComponentProps<'select'>, 'string'>,
) {
  const [props, fieldProps, selectProps] = splitProps(
    _props,
    ['collection', 'renderItem', 'variant', 'placeholder', 'value', 'onValueChange', 'readOnly', 'classes'],
    ['label', 'helperText', 'error'],
  );

  return (
    <Field {...fieldProps} name={selectProps.name} classes={props.classes}>
      <ArkSelect.Root
        collection={props.collection}
        value={props.value ? [props.value] : []}
        onValueChange={({ value }) => props.onValueChange?.(value[0])}
        readOnly={props.readOnly}
      >
        <ArkSelect.Control>
          <ArkSelect.Trigger data-variant={props.variant ?? 'solid'}>
            <ArkSelect.ValueText placeholder={props.placeholder} />
            <ArkSelect.Indicator>
              <Icon path={chevronDown} class="size-5" />
            </ArkSelect.Indicator>
          </ArkSelect.Trigger>
        </ArkSelect.Control>

        <ArkSelect.Positioner>
          <ArkSelect.Content>
            <For each={props.collection.items}>
              {(item) => (
                <ArkSelect.Item item={item}>
                  <ArkSelect.ItemText>{props.renderItem(item)}</ArkSelect.ItemText>
                  <ArkSelect.ItemIndicator>
                    <Icon path={check} class="size-5" />
                  </ArkSelect.ItemIndicator>
                </ArkSelect.Item>
              )}
            </For>
          </ArkSelect.Content>
        </ArkSelect.Positioner>

        <ArkSelect.HiddenSelect {...selectProps} id={selectProps.name} />
      </ArkSelect.Root>
    </Field>
  );
}

export function Combobox<Item>(
  _props: FieldProps & {
    collection: ListCollection<Item>;
    renderItem: (item: Item) => JSX.Element;
    variant?: FieldVariant;
    value?: string;
    onValueChange?: (value?: string) => void;
    defaultInputValue?: string;
    onInputValueChange?: (details: ComboboxInputValueChangeDetails) => void;
    loading?: boolean;
    classes?: Classes<'field'>;
    children?: JSX.Element;
  } & Omit<ComponentProps<'input'>, 'value'>,
) {
  const [props, fieldProps, inputProps] = splitProps(
    _props,
    [
      'collection',
      'renderItem',
      'variant',
      'value',
      'onValueChange',
      'defaultInputValue',
      'onInputValueChange',
      'loading',
      'classes',
      'children',
    ],
    ['label', 'helperText', 'error'],
  );

  return (
    <Field {...fieldProps} name={inputProps.name} classes={props.classes}>
      <ArkCombobox.Root
        collection={props.collection}
        defaultInputValue={props.defaultInputValue}
        onInputValueChange={props.onInputValueChange}
        value={props.value ? [props.value] : []}
        onValueChange={({ value }) => props.onValueChange?.(value[0])}
        openOnClick
      >
        <ArkCombobox.Control data-variant={props.variant ?? 'solid'}>
          <ArkCombobox.Input {...inputProps} id={inputProps.name} />
          <div data-part="end">
            <Show when={props.loading}>
              <Spinner class="size-4" />
            </Show>
            <ArkCombobox.ClearTrigger>
              <Icon path={xMark} class="size-5" />
            </ArkCombobox.ClearTrigger>
            <ArkCombobox.Trigger>
              <Icon path={chevronDown} class="size-5" />
            </ArkCombobox.Trigger>
          </div>
        </ArkCombobox.Control>

        <ArkCombobox.Positioner>
          <ArkCombobox.Content>
            <Show
              when={props.children}
              fallback={
                <For each={props.collection.items}>
                  {(item) => (
                    <ArkCombobox.Item item={item}>
                      <ArkCombobox.ItemText>{props.renderItem(item)}</ArkCombobox.ItemText>
                      <ArkCombobox.ItemIndicator>
                        <Icon path={check} class="size-5" />
                      </ArkCombobox.ItemIndicator>
                    </ArkCombobox.Item>
                  )}
                </For>
              }
            >
              {props.children}
            </Show>
          </ArkCombobox.Content>
        </ArkCombobox.Positioner>
      </ArkCombobox.Root>
    </Field>
  );
}
