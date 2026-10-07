import { describe, expect, it } from 'vitest';

import { formatExcerpt, formatFileSize } from './format';

describe('formatExcerpt', () => {
  it('turns the html into a single line of text', () => {
    expect(
      formatExcerpt('<p>Hello <strong>world</strong>.</p><ul><li>One</li><li>Two</li></ul><p>A<br>B</p>'),
    ).toBe('Hello world. One Two A B');
  });
});

describe('formatFileSize', () => {
  it('formats sizes below one megabyte in whole kilobytes', () => {
    expect(formatFileSize(12_345, 'en')).toBe('12 kB');
    expect(formatFileSize(999_499, 'en')).toBe('999 kB');
  });

  it('never formats a size below one kilobyte', () => {
    expect(formatFileSize(0, 'en')).toBe('1 kB');
    expect(formatFileSize(400, 'en')).toBe('1 kB');
  });

  it('formats sizes from one megabyte with one decimal', () => {
    expect(formatFileSize(999_500, 'en')).toBe('1 MB');
    expect(formatFileSize(1_000_000, 'en')).toBe('1 MB');
    expect(formatFileSize(2_345_678, 'en')).toBe('2.3 MB');
  });

  it('formats the size in the given locale', () => {
    expect(formatFileSize(2_345_678, 'fr')).toBe('2,3\u202fMo');
  });
});
