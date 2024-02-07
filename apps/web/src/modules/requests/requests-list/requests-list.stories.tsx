import type { Meta, StoryFn } from 'storybook-solidjs';

import RequestsListPage from './requests-list.page';

const meta = {
  title: 'Pages/Requests/RequestsList',
  parameters: {
    router: {},
  },
} satisfies Meta;

export default meta;

export const requestsList: StoryFn = () => {
  return <RequestsListPage />;
};
