import type { Meta, StoryFn } from 'storybook-solidjs';

import EditRequest from './edit-request.page';

const meta = {
  title: 'Pages/Requests/EditRequest',
  parameters: {
    router: {
      path: '/:requestId',
      location: '/requestId',
    },
  },
} satisfies Meta;

export default meta;

export const editRequest: StoryFn = () => {
  return <EditRequest />;
};
