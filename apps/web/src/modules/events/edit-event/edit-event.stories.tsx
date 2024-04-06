import type { Meta, StoryFn } from 'storybook-solidjs';

import EditEvent from './edit-event.page';

const meta = {
  title: 'Pages/Events/EditEvent',
  parameters: {
    router: {},
  },
} satisfies Meta;

export default meta;

export const editEvent: StoryFn = () => {
  return <EditEvent />;
};
