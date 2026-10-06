import { describe, expect, it } from 'vitest';

import { formatExcerpt } from './format';

describe('formatExcerpt', () => {
  it('turns the html into a single line of text', () => {
    expect(
      formatExcerpt('<p>Hello <strong>world</strong>.</p><ul><li>One</li><li>Two</li></ul><p>A<br>B</p>'),
    ).toBe('Hello world. One Two A B');
  });
});
