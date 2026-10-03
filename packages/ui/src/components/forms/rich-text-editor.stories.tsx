import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../actions/button';

import { FormField } from './form-field';
import * as RichTextEditor from './rich-text-editor';

const linkLabels: RichTextEditor.LinkLabels = {
  button: 'Link',
  url: 'Address',
  invalid: 'What to do to fix the address.',
  apply: 'Apply',
  remove: 'Remove the link',
  cancel: 'Cancel',
  close: 'Close',
};

const toolbar = (
  <RichTextEditor.Toolbar>
    <RichTextEditor.Bold label="Bold" />
    <RichTextEditor.Italic label="Italic" />
    <RichTextEditor.Underline label="Underline" />
    <RichTextEditor.Link labels={linkLabels} />
    <RichTextEditor.BulletList label="Bulleted list" />
    <RichTextEditor.OrderedList label="Numbered list" />
  </RichTextEditor.Toolbar>
);

const formattedValue = [
  '<p>A paragraph with <strong>bold</strong>, <em>italic</em>, <u>underlined</u> text and a <a href="https://example.org">link</a>.</p>',
  '<ul><li><p>First item</p></li><li><p>Second item</p></li></ul>',
  '<ol><li><p>First step</p></li><li><p>Second step</p></li></ol>',
].join('');

export default {
  title: 'Components/Forms/RichTextEditor',
  component: RichTextEditor.Root,
  args: {
    placeholder: 'Placeholder text',
    value: '',
    children: toolbar,
  },
  argTypes: {
    children: { control: false },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <FormField label="Message">
        <RichTextEditor.Root {...args} value={value} onChange={setValue} />
      </FormField>
    );
  },
} satisfies Meta<typeof RichTextEditor.Root>;

type Story = StoryObj<typeof RichTextEditor.Root>;

export const Playground: Story = {};

export const Formatted: Story = {
  args: {
    value: formattedValue,
  },
};

export const Invalid: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <FormField
        label="Message"
        hint="Hint text, shown before the field."
        error="What to do to fix the text."
      >
        <RichTextEditor.Root {...args} value={value} onChange={setValue} />
      </FormField>
    );
  },
};

export const Disabled: Story = {
  args: {
    value: formattedValue,
    disabled: true,
  },
};

/** Only the formats that the text needs. */
export const MinimalToolbar: Story = {
  args: {
    children: (
      <RichTextEditor.Toolbar>
        <RichTextEditor.Bold label="Bold" />
        <RichTextEditor.Italic label="Italic" />
      </RichTextEditor.Toolbar>
    ),
  },
};

/** Actions of the application at the end of the toolbar. The send button empties the editor. */
export const WithToolbarEnd: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');

    return (
      <FormField label="Message">
        <RichTextEditor.Root {...args} value={value} onChange={setValue}>
          <RichTextEditor.Toolbar>
            <RichTextEditor.Bold label="Bold" />
            <RichTextEditor.Italic label="Italic" />
            <RichTextEditor.Link labels={linkLabels} />
            <RichTextEditor.ToolbarEnd>
              <RichTextEditor.ToolbarButton icon="attachment" label="Attach a file" />
              <Button size="sm" onClick={() => setValue('')}>
                Send
              </Button>
            </RichTextEditor.ToolbarEnd>
          </RichTextEditor.Toolbar>
        </RichTextEditor.Root>
      </FormField>
    );
  },
};
