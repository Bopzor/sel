import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../actions/button';

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
    label: 'Message',
    placeholder: 'Placeholder text',
    value: '',
    labels,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <RichTextEditor {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof RichTextEditor>;

type Story = StoryObj<typeof RichTextEditor>;

export const Playground: Story = {};

export const WithHint: Story = {
  args: {
    hint: 'Hint text, shown before the field.',
  },
};

export const Formatted: Story = {
  args: {
    value: formattedValue,
  },
};

export const Error: Story = {
  args: {
    error: 'What to do to fix the text.',
  },
};

export const Disabled: Story = {
  args: {
    value: formattedValue,
    disabled: true,
  },
};

export const WithToolbarEnd: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');

    return (
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
    );
  },
};
