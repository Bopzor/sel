import type { Meta, StoryFn } from 'storybook-solidjs';

import CreateEvent from './create-event.page';

const meta = {
  title: 'Pages/Events/CreateEvent',
  parameters: {
    router: {},
  },
} satisfies Meta;

export default meta;

export const createEvent: StoryFn = () => {
  return <CreateEvent />;
};
