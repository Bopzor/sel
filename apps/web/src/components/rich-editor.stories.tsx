import type { Meta, StoryFn } from 'storybook-solidjs';

import { RichEditor, RichEditorToolbar, createRichEditor } from './rich-editor';

const meta = {
  title: 'Components/RichEditor',
  component: RichEditor,
  args: {
    placeholder: 'Placeholder...',
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
} satisfies Meta;

export default meta;

export const richEditor: StoryFn = () => {
  let ref!: HTMLDivElement;

  const editor = createRichEditor(() => ref, {});

  return (
    <>
      <RichEditor ref={ref} class="min-h-[8rem] border p-2" />
      <RichEditorToolbar editor={editor()} />
    </>
  );
};
