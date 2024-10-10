import { beforeEach, describe, expect, it } from 'vitest';

import { CheerioHtmlParser } from './html-parser';

describe('CheerioHtmlParser', () => {
  let adapter: CheerioHtmlParser;

  beforeEach(() => {
    adapter = new CheerioHtmlParser();
  });

  it('retrieves the text content from som html', () => {
    const html = '<p>hello</p>';
    const text = 'hello';

    expect(adapter.getTextContent(html)).toEqual(text);
  });

  it('inserts newlines between paragraphs', () => {
    const html = '<p>hello</p><p>world</p>';
    const text = 'hello\n\nworld';

    expect(adapter.getTextContent(html)).toEqual(text);
  });

  it('replaces br with line breaks', () => {
    const html = '<p>hello<br />world</p>';
    const text = 'hello\nworld';

    expect(adapter.getTextContent(html)).toEqual(text);
  });
});
