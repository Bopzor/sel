import type { Meta, StoryObj } from '@storybook/react-vite';
import clsx from 'clsx';

export default {
  title: 'Foundations/Typography',
} satisfies Meta;

type Story = StoryObj;

const styles = [
  { className: 'text-display', usage: 'Welcome title, rare. 28px below 640px.', sample: 'Display' },
  { className: 'text-title-1', usage: 'Page title (h1). 24px below 640px.', sample: 'Page title' },
  { className: 'text-title-2', usage: 'Section title (h2).', sample: 'Section title' },
  { className: 'text-title-3', usage: 'Card, dialog title (h3).', sample: 'Card title' },
  {
    className: 'text-body-lg',
    usage: 'Introduction, content of a post.',
    sample: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    className: 'text-body',
    usage: 'Default body text.',
    sample: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    className: 'text-body-strong',
    usage: 'Emphasis in body text, member names.',
    sample: 'Strong body text',
  },
  { className: 'text-body-sm', usage: 'Descriptions, field hints, metadata.', sample: 'Small body text' },
  { className: 'text-caption', usage: 'Smallest size: badges, bottom bar labels.', sample: 'Caption' },
  { className: 'text-label', usage: 'Field, checkbox and option labels.', sample: 'Label' },
  { className: 'text-button', usage: 'Button labels.', sample: 'Button' },
  { className: 'text-button-sm', usage: 'Labels of sm buttons.', sample: 'Small button' },
  { className: 'text-amount tabular-nums', usage: 'Balance, highlighted amounts.', sample: '1,234' },
];

export const TextStyles: Story = {
  render: () => (
    <ul className="flex flex-col">
      {styles.map(({ className, usage, sample }) => (
        <li key={className} className="grid gap-2 border-b py-4 md:grid-cols-3">
          <div className="flex flex-col">
            <code className="text-caption text-default">{className}</code>
            <span className="text-body-sm text-muted">{usage}</span>
          </div>
          <p className={clsx('md:col-span-2', className)}>{sample}</p>
        </li>
      ))}
    </ul>
  ),
};
