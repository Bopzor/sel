import type { Meta, StoryFn } from 'storybook-solidjs';

import MembersListPage from './members-list.page';

const meta = {
  title: 'Pages/Members/MembersList',
  parameters: {
    router: {},
  },
} satisfies Meta;

export default meta;

export const membersList: StoryFn = () => {
  return <MembersListPage />;
};
