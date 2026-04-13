import { createListCollection, useAsyncList, useFilter, useListCollection } from '@ark-ui/solid';
import { createForm, getValues, setValue } from '@modular-forms/solid';
import { identity, noop } from '@sel/utils';
import { createMemo, createSignal } from 'solid-js';
import { Meta, StoryFn } from 'storybook-solidjs-vite';
import z from 'zod';

import { zodForm } from 'src/utils/validation';

import { Button } from './button';
import { Combobox, FieldVariant, Input, Select, Textarea } from './form-controls';
import { Spinner } from './spinner';

type Args = {
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
  variant: FieldVariant;
  label: string;
  placeholder: string;
  helperText: string;
  error: string;
};

export default {
  title: 'Form controls',
  args: {
    required: false,
    disabled: false,
    readOnly: false,
    variant: 'solid',
    label: '',
    placeholder: '',
    helperText: '',
    error: '',
  },
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outlined'] satisfies FieldVariant[] },
  },
  decorators: (Story) => (
    <div class="max-w-sm">
      <Story />
    </div>
  ),
} satisfies Meta<Args>;

type Story = StoryFn<Args>;

const items = ['Solid', 'React', 'Arrow'];

export const input: Story = (args) => {
  const [value, setValue] = createSignal('');

  return <Input {...args} value={value()} onInput={(event) => setValue(event.target.value)} />;
};

export const textarea: Story = (args) => {
  const [value, setValue] = createSignal('');

  return <Textarea {...args} value={value()} onInput={(event) => setValue(event.target.value)} />;
};

export const select: Story = (args) => {
  const collection = createListCollection({ items });
  const [value, setValue] = createSignal(collection.at(0));

  return (
    <Select
      {...args}
      collection={collection}
      renderItem={identity}
      value={value()}
      onValueChange={setValue}
    />
  );
};

export const combobox: Story = (args) => {
  const filterFn = useFilter({ sensitivity: 'base' });
  const { collection, filter } = useListCollection({ initialItems: items, filter: filterFn().contains });
  const [value, setValue] = createSignal(collection().at(0));

  return (
    <Combobox
      {...args}
      collection={collection()}
      renderItem={identity}
      value={value()}
      onValueChange={setValue}
      onInputValueChange={({ inputValue }) => filter(inputValue)}
    />
  );
};

export const comboboxAsync: Story = (args) => {
  const list = useAsyncList<string>({
    async load({ filterText, signal }) {
      if (!filterText) {
        return { items: [] };
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (signal?.aborted) {
        return { items: [] };
      }

      await new Promise((r) => setTimeout(r, 1000));

      return {
        items: items.filter((item) => item.toLowerCase().includes(filterText.toLowerCase())),
      };
    },
  });

  const collection = createMemo(() => {
    return createListCollection({
      items: list().items,
    });
  });

  return (
    <Combobox
      {...args}
      collection={collection()}
      renderItem={identity}
      onInputValueChange={({ inputValue, reason }) => {
        if (reason === 'input-change') {
          list().setFilterText(inputValue);
        }
      }}
      end={
        list().loading && (
          <div>
            <Spinner class="size-4" />
          </div>
        )
      }
    />
  );
};

export const form: StoryFn = () => {
  const [form, { Form, Field }] = createForm({
    initialValues: {
      input: '',
      textarea: '',
      select: '',
      combobox: '',
    },
    validate: zodForm(
      z.object({
        input: z.string().min(1),
        textarea: z.string().min(1),
        select: z.string().min(1),
        combobox: z.string().min(1),
      }),
    ),
  });

  const selectCollection = createListCollection({ items });

  const filterFn = useFilter({ sensitivity: 'base' });
  const { collection: comboboxCollection, filter } = useListCollection({
    initialItems: items,
    filter: filterFn().contains,
  });

  return (
    <Form class="col gap-4">
      <Field name="input">
        {(field, props) => <Input {...props} label="Input" value={field.value} error={field.error} />}
      </Field>

      <Field name="textarea">
        {(field, props) => <Textarea {...props} label="Textarea" value={field.value} error={field.error} />}
      </Field>

      <Field name="select">
        {(field, props) => (
          <Select
            {...props}
            collection={selectCollection}
            label="Select"
            value={field.value}
            error={field.error}
            renderItem={(item) => item}
            onValueChange={(item) => setValue(form, 'select', item ? item : '')}
          />
        )}
      </Field>

      <Field name="combobox">
        {(field, props) => (
          <Combobox
            {...props}
            collection={comboboxCollection()}
            onInputValueChange={({ inputValue }) => filter(inputValue)}
            label="Combobox"
            value={field.value}
            error={field.error}
            renderItem={(item) => item}
            onValueChange={(item) => setValue(form, 'combobox', item ? item : '')}
            onInput={noop}
          />
        )}
      </Field>

      <Button type="submit">Submit</Button>

      <hr />

      <pre>{JSON.stringify(getValues(form), null, 2)}</pre>
    </Form>
  );
};
