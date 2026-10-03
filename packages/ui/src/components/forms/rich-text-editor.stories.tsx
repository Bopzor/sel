import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps, type ReactNode } from 'react';

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

type RichTextEditorStoryArgs = ComponentProps<typeof RichTextEditor.Root> & {
  toolbar?: ReactNode;
};

export default {
  title: 'Components/Forms/RichTextEditor',
  component: RichTextEditor.Root,
  args: {
    placeholder: 'Placeholder text',
    value: '',
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <FormField label="Message">
        <RichTextEditor.Root {...args} value={value} onChange={setValue}>
          <RichTextEditor.Textarea toolbar={toolbar} />
        </RichTextEditor.Root>
      </FormField>
    );
  },
} satisfies Meta<RichTextEditorStoryArgs>;

type Story = StoryObj<RichTextEditorStoryArgs>;

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
        <RichTextEditor.Root {...args} value={value} onChange={setValue}>
          <RichTextEditor.Textarea toolbar={toolbar} />
        </RichTextEditor.Root>
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
    toolbar: (
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
          <RichTextEditor.Textarea
            toolbar={
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
            }
          />
        </RichTextEditor.Root>
      </FormField>
    );
  },
};

/** Without `Textarea`, the layout is the application's: `EditorContent` is the editable text, `Toolbar` goes anywhere inside `Root`. */
export const CustomLayout: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');

    return (
      <RichTextEditor.Root {...args} value={value} onChange={setValue}>
        <RichTextEditor.EditorContent className="stack h-20 rounded-md border px-4 py-3 text-body" />
        {toolbar}
      </RichTextEditor.Root>
    );
  },
};
