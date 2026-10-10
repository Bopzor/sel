import type { Meta, StoryObj } from '@storybook/react-vite';

import { RichText } from './rich-text';

export default {
  title: 'Components/Display/RichText',
  component: RichText,
  args: {
    unsafeHtml: [
      '<p>A paragraph with <strong>bold</strong>, <em>italic</em>, <u>underlined</u> text and a <a href="https://example.org">link</a>.</p>',
      '<ul><li><p>First item</p></li><li><p>Second item</p></li></ul>',
      '<ol><li><p>First step</p></li><li><p>Second step</p></li></ol>',
      '<p>A last paragraph.</p>',
    ].join(''),
  },
} satisfies Meta<typeof RichText>;

type Story = StoryObj<typeof RichText>;

export const Playground: Story = {};

export const Paragraph: Story = {
  args: {
    unsafeHtml: '<p>A single paragraph, without formatting.</p>',
  },
};
