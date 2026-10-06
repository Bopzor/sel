import { describe, expect, it } from 'vitest';

import { formatEventDate, formatExcerpt } from './format';

describe('formatEventDate', () => {
  const now = new Date(2026, 9, 5);

  it('formats a date of this year without the year', () => {
    expect(formatEventDate(new Date(2026, 9, 12, 18, 30), 'en', now)).toBe('Monday, October 12 at 6:30 PM');
    expect(formatEventDate(new Date(2026, 9, 12, 18, 30), 'fr', now)).toBe('lundi 12 octobre à 18:30');
  });

  it('formats a date of another year with the year', () => {
    expect(formatEventDate(new Date(2027, 0, 9, 10, 0), 'en', now)).toBe(
      'Saturday, January 9, 2027 at 10:00 AM',
    );
  });
});

describe('formatExcerpt', () => {
  it('turns the html into a single line of text', () => {
    expect(
      formatExcerpt('<p>Hello <strong>world</strong>.</p><ul><li>One</li><li>Two</li></ul><p>A<br>B</p>'),
    ).toBe('Hello world. One Two A B');
  });
});
