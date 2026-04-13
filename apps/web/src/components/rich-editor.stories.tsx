import { createSignal } from 'solid-js';
import { Meta, StoryFn } from 'storybook-solidjs-vite';

import { RichEditor } from './rich-editor';

type Args = {
  label: string;
  placeholder: string;
  error: string;
};

export default {
  title: 'RichEditor',
  args: {
    label: '',
    placeholder: '',
    error: '',
  },
} satisfies Meta<Args>;

export const richEditor: StoryFn<Args> = (args) => {
  const [value, setValue] = createSignal('');

  return <RichEditor {...args} initialValue={value()} onChange={setValue} />;
};
