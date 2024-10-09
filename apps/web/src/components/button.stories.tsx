import { Meta, StoryObj } from 'storybook-solidjs';

import { Button } from './button';

export default {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Click me',
    loading: false,
  },
} satisfies Meta<typeof Button>;

export const button: StoryObj<typeof Button> = {};
