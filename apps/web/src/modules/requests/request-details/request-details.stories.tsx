import type { Meta, StoryFn } from 'storybook-solidjs';

import RequestDetailsPage from './request-details.page';

const meta = {
  title: 'Pages/Requests/RequestDetails',
  parameters: {
    router: {
      path: '/:requestId',
      location: '/requestId',
    },
  },
} satisfies Meta;

export default meta;

export const requestDetails: StoryFn = () => {
  return <RequestDetailsPage />;
};
