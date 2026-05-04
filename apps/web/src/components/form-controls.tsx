import {
  Combobox as ArkCombobox,
  ComboboxInputValueChangeDetails,
  ListCollection,
  useComboboxContext,
} from '@ark-ui/solid/combobox';
import { Field as ArkField } from '@ark-ui/solid/field';
import { Select as ArkSelect } from '@ark-ui/solid/select';
import { Icon } from 'solid-heroicons';
import { check, chevronDown, xMark } from 'solid-heroicons/solid';
import { ComponentProps, createRenderEffect, For, JSX, Show, splitProps } from 'solid-js';
import { Portal } from 'solid-js/web';

export type FieldVariant = 'solid' | 'outlined';

type Classes<Part extends string> = Partial<Record<Part, string>>;

type FieldProps = {
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  label?: JSX.Element;
  helperText?: JSX.Element;
  error?: JSX.Element;
};

export function Field(props: FieldProps & { classes?: Classes<'field'>; children: JSX.Element }) {
  return (
    <ArkField.Root
      required={props.required}
      disabled={props.disabled}
      readOnly={props.readOnly}
      invalid={Boolean(props.error)}
      class={props.classes?.field}
    >
      {props.label && (
        <ArkField.Label>
          {props.label}
          <ArkField.RequiredIndicator />
        </ArkField.Label>
      )}

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
    ['required', 'disabled', 'readOnly', 'label', 'helperText', 'error'],
  );

  return (
    <Field {...fieldProps} classes={props.classes}>
      <div
        data-scope="field"
        data-part="input-shell"
        data-variant={props.variant ?? 'solid'}
        class={props.classes?.shell}
      >
        {props.start}
        <ArkField.Input {...inputProps} class={props.classes?.input} />
        {props.end}
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
    ['required', 'disabled', 'readOnly', 'label', 'helperText', 'error'],
  );

  return (
    <Field {...fieldProps} classes={props.classes}>
      <ArkField.Textarea
        {...textareaProps}
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
    start?: JSX.Element;
    end?: JSX.Element;
    placeholder?: string;
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    readOnly?: boolean;
    deselectable?: boolean;
    classes?: Classes<'field'>;
  } & Omit<ComponentProps<'select'>, 'value'>,
) {
  const [props, fieldProps, selectProps] = splitProps(
    _props,
    [
      'collection',
      'renderItem',
      'variant',
      'start',
      'end',
      'placeholder',
      'value',
      'onValueChange',
      'deselectable',
      'classes',
    ],
    ['required', 'disabled', 'readOnly', 'label', 'helperText', 'error'],
  );

  return (
    <Field {...fieldProps} classes={props.classes}>
      <ArkSelect.Root
        collection={props.collection}
        value={props.value ? [props.value] : []}
        onValueChange={({ value }) => props.onValueChange?.(value[0] ?? null)}
        deselectable={props.deselectable}
      >
        <ArkSelect.Control>
          <ArkSelect.Trigger data-variant={props.variant ?? 'solid'}>
            {props.start}

            <ArkSelect.ValueText placeholder={props.placeholder} />

            {props.end}

            <ArkSelect.Indicator>
              <Icon path={chevronDown} class="size-5" />
            </ArkSelect.Indicator>
          </ArkSelect.Trigger>
        </ArkSelect.Control>

        <Portal mount={document.getElementById('root')!}>
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
        </Portal>

        <ArkSelect.HiddenSelect {...selectProps} />
      </ArkSelect.Root>
    </Field>
  );
}

export function Combobox<Item>(
  _props: FieldProps & {
    collection: ListCollection<Item>;
    renderItem: (item: Item) => JSX.Element;
    variant?: FieldVariant;
    start?: JSX.Element;
    end?: JSX.Element;
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    defaultInputValue?: string;
    onInputValueChange?: (details: ComboboxInputValueChangeDetails) => void;
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
      'start',
      'end',
      'value',
      'onValueChange',
      'defaultInputValue',
      'onInputValueChange',
      'classes',
      'children',
    ],
    ['required', 'disabled', 'readOnly', 'label', 'helperText', 'error'],
  );

  return (
    <Field {...fieldProps} classes={props.classes}>
      <ArkCombobox.Root
        collection={props.collection}
        defaultInputValue={props.defaultInputValue}
        onInputValueChange={props.onInputValueChange}
        value={props.value ? [props.value] : []}
        onValueChange={({ value }) => props.onValueChange?.(value[0] ?? null)}
        openOnClick
      >
        <ComboboxRehydrateValue />

        <ArkCombobox.Control data-variant={props.variant ?? 'solid'}>
          {props.start}

          <ArkCombobox.Input {...inputProps} />

          {props.end}

          <ArkCombobox.ClearTrigger>
            <Icon path={xMark} class="size-5" />
          </ArkCombobox.ClearTrigger>

          <ArkCombobox.Trigger>
            <Icon path={chevronDown} class="size-5" />
          </ArkCombobox.Trigger>
        </ArkCombobox.Control>

        <Portal mount={document.getElementById('root')!}>
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
        </Portal>
      </ArkCombobox.Root>
    </Field>
  );
}

function ComboboxRehydrateValue() {
  const combobox = useComboboxContext();
  let hydrated = false;

  createRenderEffect(() => {
    if (combobox().value.length && combobox().collection.size && !hydrated) {
      combobox().syncSelectedItems();
      hydrated = true;
    }
  });

  return null;
}
