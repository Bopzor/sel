import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../actions/button';

import { Field } from './field';
import {
  RichTextBold,
  RichTextBulletList,
  RichTextEditor,
  RichTextItalic,
  RichTextLink,
  RichTextOrderedList,
  RichTextToolbar,
  RichTextToolbarButton,
  RichTextToolbarEnd,
  RichTextUnderline,
  type RichTextLinkLabels,
} from './rich-text-editor';

const linkLabels: RichTextLinkLabels = {
  button: 'Link',
  url: 'Address',
  invalid: 'What to do to fix the address.',
  apply: 'Apply',
  remove: 'Remove the link',
  cancel: 'Cancel',
  close: 'Close',
};

const toolbar = (
  <RichTextToolbar>
    <RichTextBold label="Bold" />
    <RichTextItalic label="Italic" />
    <RichTextUnderline label="Underline" />
    <RichTextLink labels={linkLabels} />
    <RichTextBulletList label="Bulleted list" />
    <RichTextOrderedList label="Numbered list" />
  </RichTextToolbar>
);

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
    children: toolbar,
  },
  argTypes: {
    children: { control: false },
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

/** Only the formats that the text needs. */
export const MinimalToolbar: Story = {
  args: {
    children: (
      <RichTextToolbar>
        <RichTextBold label="Bold" />
        <RichTextItalic label="Italic" />
      </RichTextToolbar>
    ),
  },
};

/** Actions of the application at the end of the toolbar. The send button empties the editor. */
export const WithToolbarEnd: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');

    return (
      <Field label="Message">
        <RichTextEditor {...args} value={value} onChange={setValue}>
          <RichTextToolbar>
            <RichTextBold label="Bold" />
            <RichTextItalic label="Italic" />
            <RichTextLink labels={linkLabels} />
            <RichTextToolbarEnd>
              <RichTextToolbarButton icon="attachment" label="Attach a file" />
              <Button size="sm" onClick={() => setValue('')}>
                Send
              </Button>
            </RichTextToolbarEnd>
          </RichTextToolbar>
        </RichTextEditor>
      </Field>
    );
  },
};
