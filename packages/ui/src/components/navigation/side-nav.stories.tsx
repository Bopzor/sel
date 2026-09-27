import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import logo from '../../assets/logo.svg';

import { SideNav, type SideNavSection } from './side-nav';

const sections: SideNavSection[] = [
  {
    items: [
      { value: 'home', label: 'Home', icon: 'home', href: '#home' },
      { value: 'requests', label: 'Requests', icon: 'request', href: '#requests' },
      { value: 'events', label: 'Events', icon: 'event', href: '#events' },
    ],
  },
  {
    title: 'First group',
    items: [
      { value: 'members', label: 'Members', icon: 'members', href: '#members' },
      { value: 'information', label: 'Information', icon: 'information', href: '#information' },
    ],
  },
  {
    title: 'Second group',
    items: [
      { value: 'profile', label: 'Profile', icon: 'profile', href: '#profile' },
      { value: 'settings', label: 'Settings', icon: 'settings', href: '#settings' },
    ],
  },
];

export default {
  title: 'Components/Navigation/SideNav',
  component: SideNav,
  args: {
    name: 'Instance name',
    place: 'Geographical area',
    logo,
    sections,
    value: 'home',
    label: 'Main navigation',
  },
  parameters: { layout: 'fullscreen' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <SideNav {...args} value={value} onChange={setValue} className="min-h-screen" />;
  },
} satisfies Meta<typeof SideNav>;

type Story = StoryObj<typeof SideNav>;

export const Playground: Story = {};

export const LongName: Story = {
  args: { name: 'A very long instance name that does not fit', place: 'A long geographical area name' },
};

export const WithoutPlace: Story = {
  args: { place: undefined },
};
