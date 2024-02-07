import type { Meta, StoryFn } from 'storybook-solidjs';

import CreateRequest from './create-request.page';

const meta = {
  title: 'Pages/Requests/CreateRequest',
  parameters: {
    router: {},
  },
} satisfies Meta;

export default meta;

export const createRequest: StoryFn = () => {
  return <CreateRequest />;
};
