import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import logo from '../../assets/logo.svg';
import { Badge } from '../display/badge';

import { SideNav, SideNavFooter, SideNavHeader, SideNavItem, SideNavSection } from './side-nav';

import type { IconName } from '../display/icon';

type Entry = { value: string; label: string; icon: IconName };

const sections: { title?: string; items: Entry[] }[] = [
  {
    items: [
      { value: 'home', label: 'Home', icon: 'home' },
      { value: 'requests', label: 'Requests', icon: 'request' },
      { value: 'events', label: 'Events', icon: 'event' },
    ],
  },
  {
    title: 'First group',
    items: [
      { value: 'members', label: 'Members', icon: 'members' },
      { value: 'information', label: 'Information', icon: 'information' },
    ],
  },
  {
    title: 'Second group',
    items: [
      { value: 'profile', label: 'Profile', icon: 'profile' },
      { value: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export default {
  title: 'Components/Navigation/SideNav',
  component: SideNav,
  args: {
    'aria-label': 'Main navigation',
  },
  argTypes: {
    children: { control: false },
  },
  parameters: { layout: 'fullscreen' },
  render: function Render(args) {
    const [value, setValue] = useState('home');

    return (
      <SideNav {...args} className="min-h-screen">
        <SideNavHeader logo={logo} name="Instance name" place="Geographical area" />
        {sections.map((section, index) => (
          <SideNavSection key={index} title={section.title}>
            {section.items.map((item) => (
              <SideNavItem
                key={item.value}
                href={`#${item.value}`}
                icon={item.icon}
                active={item.value === value}
                onClick={() => setValue(item.value)}
              >
                {item.label}
              </SideNavItem>
            ))}
          </SideNavSection>
        ))}
      </SideNav>
    );
  },
} satisfies Meta<typeof SideNav>;

type Story = StoryObj<typeof SideNav>;

export const Playground: Story = {};

/** A count after an entry's label, and the account's entries at the bottom. */
export const WithBadgeAndFooter: Story = {
  render: (args) => (
    <SideNav {...args} className="min-h-screen">
      <SideNavHeader logo={logo} name="Instance name" place="Geographical area" />
      <SideNavSection>
        <SideNavItem href="#home" icon="home" active>
          Home
        </SideNavItem>
        <SideNavItem href="#notifications" icon="notifications" badge={<Badge tone="primary">3</Badge>}>
          Notifications
        </SideNavItem>
      </SideNavSection>
      <SideNavFooter>
        <SideNavSection>
          <SideNavItem href="#profile" icon="profile">
            Profile
          </SideNavItem>
          <SideNavItem href="#sign-out" icon="sign-out">
            Sign out
          </SideNavItem>
        </SideNavSection>
      </SideNavFooter>
    </SideNav>
  ),
};

export const LongName: Story = {
  render: (args) => (
    <SideNav {...args} className="min-h-screen">
      <SideNavHeader
        logo={logo}
        name="A very long instance name that does not fit"
        place="A long geographical area name"
      />
    </SideNav>
  ),
};

export const WithoutPlace: Story = {
  render: (args) => (
    <SideNav {...args} className="min-h-screen">
      <SideNavHeader logo={logo} name="Instance name" />
    </SideNav>
  ),
};
