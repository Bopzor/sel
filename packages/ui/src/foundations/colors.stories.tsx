import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import theme from '../theme.css?raw';

export default {
  title: 'Foundations/Colors',
} satisfies Meta;

type Story = StoryObj;

// The lists are read from theme.css, so that a new token shows up here without being added by hand.
const tokens = (pattern: RegExp) => Array.from(theme.matchAll(pattern), ([, name]) => name!);

const backgrounds = tokens(/--background-color-([\w-]+):/g);
const texts = tokens(/--text-color-([\w-]+):/g);
const borders = tokens(/--border-color-([\w-]+):/g);

const ranges: Record<string, string[]> = {};

for (const [, range, step] of theme.matchAll(/--([a-z]+)-(\d+):/g)) {
  ranges[range!] ??= [];
  ranges[range!]!.push(step!);
}

const statuses = ['accent', 'success', 'warning', 'danger', 'info'];

// The background a text color is meant for.
function backgroundOf(text: string) {
  if (text.startsWith('on-')) return text.slice('on-'.length);
  if (text.startsWith('inverse')) return 'inverse';
  if (statuses.includes(text)) return `${text}-subtle`;
  if (text === 'disabled' || text === 'avatar') return text;
  return 'surface';
}

function Group({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-3">{title}</h2>
      <p className="max-w-content text-body-sm text-muted">{description}</p>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">{children}</ul>
    </section>
  );
}

function Name({ children }: { children: string }) {
  return <code className="text-caption text-muted">{children}</code>;
}

export const Semantic: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Group title="Backgrounds" description="bg-*">
        {backgrounds.map((token) => (
          <li key={token} className="flex flex-col gap-1">
            <div
              className="h-14 rounded-md border"
              style={{ backgroundColor: `var(--background-color-${token})` }}
            />
            <Name>{`bg-${token}`}</Name>
          </li>
        ))}
      </Group>

      <Group title="Text" description="text-*, shown on the background each one is meant for.">
        {texts.map((token) => (
          <li key={token} className="flex flex-col gap-1">
            <div
              className="flex h-14 items-center justify-center rounded-md border text-title-3"
              style={{
                color: `var(--text-color-${token})`,
                backgroundColor: `var(--background-color-${backgroundOf(token)})`,
              }}
            >
              Aa
            </div>
            <Name>{`text-${token}`}</Name>
          </li>
        ))}
      </Group>

      <Group title="Borders" description="border-*">
        {borders.map((token) => (
          <li key={token} className="flex flex-col gap-1">
            <div
              className="h-14 rounded-md border-2 bg-surface"
              style={{ borderColor: `var(--border-color-${token})` }}
            />
            <Name>{`border-${token}`}</Name>
          </li>
        ))}
      </Group>
    </div>
  ),
};

export const Ranges: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <p className="max-w-content text-body-sm text-muted">
        Ranges are private: they only define the semantic tokens and have no utility. An instance only
        replaces the brand and accent ranges.
      </p>
      {Object.entries(ranges).map(([range, steps]) => (
        <section key={range} className="flex flex-col gap-2">
          <h2 className="text-title-3">{range}</h2>
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
            {steps.map((step) => (
              <li key={step} className="flex flex-col gap-1">
                <div
                  className="h-14 rounded-md border"
                  style={{ backgroundColor: `var(--${range}-${step})` }}
                />
                <Name>{`${range}-${step}`}</Name>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  ),
};
