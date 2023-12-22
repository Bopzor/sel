import { HtmlParserPort } from './html-parser.port';

export class FakeHtmlParserAdapter implements HtmlParserPort {
  getTextContent(html: string): string {
    return `text content of ${html}`;
  }
}
