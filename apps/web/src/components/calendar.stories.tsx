import type { Meta, StoryObj } from 'storybook-solidjs';

import { Calendar } from './calendar';

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  args: {
    year: 2024,
    month: 1,
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const calendar: Story = {};
