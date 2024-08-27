import { load } from 'cheerio';
import { injectableClass } from 'ditox';

import { HtmlParserPort } from './html-parser.port';

export class CheerioHtmlParserAdapter implements HtmlParserPort {
  static inject = injectableClass(this);

  static endOfParagraph = '__EOP__';
  static lineBreak = '__LB__';

  getTextContent(html: string): string {
    return load(html)
      .root()
      .find('p')
      .append(CheerioHtmlParserAdapter.endOfParagraph)
      .end()
      .find('br')
      .replaceWith(CheerioHtmlParserAdapter.lineBreak)
      .end()
      .text()
      .replaceAll(CheerioHtmlParserAdapter.endOfParagraph, '\n\n')
      .replaceAll(CheerioHtmlParserAdapter.lineBreak, '\n')
      .trim();
  }
}
