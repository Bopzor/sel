import { load } from 'cheerio';
import { injectableClass } from 'ditox';

import { HtmlParserPort } from './html-parser.port';

export class CheerioHtmlParserAdapter implements HtmlParserPort {
  static inject = injectableClass(this);

  getTextContent(html: string): string {
    return load(html).text();
  }
}
