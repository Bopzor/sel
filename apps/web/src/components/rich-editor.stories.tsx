import type { Meta, StoryFn } from 'storybook-solidjs';

import { RichEditor } from './rich-editor';

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
  return <RichEditor />;
};
