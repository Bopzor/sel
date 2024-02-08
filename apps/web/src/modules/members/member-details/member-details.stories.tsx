import type { Meta, StoryFn } from 'storybook-solidjs';

import MemberDetailsPage from './member-details.page';

const meta = {
  title: 'Pages/Members/MemberDetails',
  parameters: {
    router: {
      path: '/:memberId',
      location: '/memberId',
    },
  },
} satisfies Meta;

export default meta;

export const memberDetails: StoryFn = () => {
  return <MemberDetailsPage />;
};
