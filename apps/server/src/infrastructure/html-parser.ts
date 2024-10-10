import { load } from 'cheerio';
import { injectableClass } from 'ditox';

export interface HtmlParser {
  getTextContent(html: string): string;
}

export class CheerioHtmlParser implements HtmlParser {
  static inject = injectableClass(this);

  static endOfParagraph = '__EOP__';
  static lineBreak = '__LB__';

  getTextContent(html: string): string {
    return load(html)
      .root()
      .find('p')
      .append(CheerioHtmlParser.endOfParagraph)
      .end()
      .find('br')
      .replaceWith(CheerioHtmlParser.lineBreak)
      .end()
      .text()
      .replaceAll(CheerioHtmlParser.endOfParagraph, '\n\n')
      .replaceAll(CheerioHtmlParser.lineBreak, '\n')
      .trim();
  }
}
