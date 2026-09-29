import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../actions/button';

import { Field } from './field';
import { RichTextEditor, ToolbarButton, type RichTextEditorLabels } from './rich-text-editor';

const labels: RichTextEditorLabels = {
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  link: 'Link',
  bulletList: 'Bulleted list',
  orderedList: 'Numbered list',
  linkUrl: 'Address',
  linkInvalid: 'What to do to fix the address.',
  linkApply: 'Apply',
  linkRemove: 'Remove the link',
  linkCancel: 'Cancel',
  close: 'Close',
};

const formattedValue = [
  '<p>A paragraph with <strong>bold</strong>, <em>italic</em>, <u>underlined</u> text and a <a href="https://example.org">link</a>.</p>',
  '<ul><li><p>First item</p></li><li><p>Second item</p></li></ul>',
  '<ol><li><p>First step</p></li><li><p>Second step</p></li></ol>',
].join('');

export default {
  title: 'Components/Forms/RichTextEditor',
  component: RichTextEditor,
  args: {
    placeholder: 'Placeholder text',
    value: '',
    labels,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <Field label="Message">
        <RichTextEditor {...args} value={value} onChange={setValue} />
      </Field>
    );
  },
} satisfies Meta<typeof RichTextEditor>;

type Story = StoryObj<typeof RichTextEditor>;

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
      <Field label="Message" hint="Hint text, shown before the field." error="What to do to fix the text.">
        <RichTextEditor {...args} value={value} onChange={setValue} />
      </Field>
    );
  },
};

export const Disabled: Story = {
  args: {
    value: formattedValue,
    disabled: true,
  },
};

/** The send button empties the editor. */
export const WithToolbarEnd: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');

    return (
      <Field label="Message">
        <RichTextEditor
          {...args}
          value={value}
          onChange={setValue}
          toolbarEnd={
            <>
              <ToolbarButton icon="attachment" label="Attach a file" />
              <Button size="sm" onClick={() => setValue('')}>
                Send
              </Button>
            </>
          }
        />
      </Field>
    );
  },
};
