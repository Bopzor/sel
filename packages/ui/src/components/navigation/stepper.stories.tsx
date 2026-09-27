import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stepper } from './stepper';

export default {
  title: 'Components/Navigation/Stepper',
  component: Stepper,
  args: {
    steps: ['First', 'Second', 'Third'],
    current: 2,
    progressLabel: 'Step 2 of 3',
  },
  render: (args) => <Stepper {...args} progressLabel={`Step ${args.current} of ${args.steps.length}`} />,
} satisfies Meta<typeof Stepper>;

type Story = StoryObj<typeof Stepper>;

export const Playground: Story = {};

export const FirstStep: Story = {
  args: { current: 1 },
};

export const FiveSteps: Story = {
  args: { steps: ['First', 'Second', 'Third', 'Fourth', 'Fifth'], current: 4 },
};
