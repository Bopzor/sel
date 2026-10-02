import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { assert } from '@sel/utils';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RelativeDate } from './relative-date';

const now = new Date(2026, 5, 15, 12);

describe('RelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderDate(date: Date) {
    const { container } = render(
      <I18nProvider i18n={i18n}>
        <RelativeDate date={date.toISOString()} />
      </I18nProvider>,
    );

    const time = container.querySelector('time');

    assert(time);

    return time;
  }

  function label(date: Date) {
    return renderDate(date).textContent;
  }

  function ago(minutes: number) {
    return new Date(now.getTime() - minutes * 60 * 1000);
  }

  it('shows a minute at least', () => {
    expect(label(now)).toBe('1 minute ago');
    expect(label(ago(-5))).toBe('1 minute ago');
  });

  it('shows the minutes, under an hour', () => {
    expect(label(ago(59))).toBe('59 minutes ago');
  });

  it('shows the hours, under a day', () => {
    expect(label(ago(60))).toBe('1 hour ago');
    expect(label(ago(23 * 60 + 59))).toBe('23 hours ago');
  });

  it('shows the days, under a week', () => {
    expect(label(ago(24 * 60))).toBe('yesterday');
    expect(label(ago(6 * 24 * 60))).toBe('6 days ago');
  });

  it('counts the days in calendar days', () => {
    expect(label(new Date(2026, 5, 13, 22))).toBe('2 days ago');
    expect(label(new Date(2026, 5, 8, 13))).toBe('June 8');
  });

  it('shows the date without the year, from a week in the same year', () => {
    expect(label(ago(7 * 24 * 60))).toBe('June 8');
  });

  it('shows the date with the year, in an earlier year', () => {
    expect(label(new Date(2025, 11, 31, 12))).toBe('December 31, 2025');
  });

  it('shows the full date as a title', () => {
    const time = renderDate(ago(60));

    expect(time.getAttribute('title')).toBe('Monday, June 15, 2026');
    expect(time.getAttribute('datetime')).toBe(ago(60).toISOString());
  });
});
