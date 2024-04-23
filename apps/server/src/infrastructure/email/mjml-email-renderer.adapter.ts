import { injectableClass } from 'ditox';
import mjml2html from 'mjml';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';
import { LoggerPort } from '../logger/logger.port';

import { EmailRendererPort } from './email-renderer.port';
import { Email } from './email.types';

export class MjmlEmailRendererAdapter implements EmailRendererPort {
  static inject = injectableClass(this, TOKENS.logger, TOKENS.config);

  constructor(
    private readonly logger: LoggerPort,
    private readonly config: ConfigPort,
  ) {}

  render(props: { subject: string; html: string[]; text: string[] }): Omit<Email, 'to'> {
    const { subject, html, text } = props;
    const result = mjml2html(this.renderEmail(subject, html));

    if (result.errors) {
      this.logger.warn(result.errors);
    }

    return {
      subject,
      text: text.join('\n\n'),
      html: result.html,
    };
  }

  public userContent(children: string) {
    return `<div style="padding: 8px 16px; border: 1px solid #CCC; border-radius: 4px; background: #fafafc">${children}</div>`;
  }

  private renderEmail(preview: string, sections: string[]) {
    return `
      <mjml>
        ${this.renderHead(preview)}
        ${this.renderBody(sections)}
      </mjml>
    `;
  }

  private renderHead(preview: string) {
    const styles = `
      .strong {
        font-weight: 600;
        color: #333;
      }
    `;

    return `
      <mj-head>
        <mj-font name="Inter" href="https://fonts.googleapis.com/css?family=Inter" />

        <mj-attributes>
          <mj-all padding="0" font-family="Inter, sans-serif" font-size="16px" line-height="21px" />
        </mj-attributes>

        <mj-style inline="inline">
          ${styles}
        </mj-style>

        <mj-preview>${preview}</mj-preview>
      </mj-head>
    `;
  }

  private renderBody(sections: string[]) {
    return `
      <mj-body>
        ${this.renderHeader()}

        ${this.renderSection('<mj-spacer height="30px" />', '0')}

        ${sections.map((section) => this.renderSection(`<mj-text>${section}</mj-text>`))}

        ${this.renderSection('<mj-divider border-color="#005f7e"></mj-divider>', '24px 0')}
      </mj-body>
    `;
  }

  private get appBaseUrl() {
    return this.config.app.baseUrl;
  }

  private renderHeader() {
    return `
      <mj-section background-color="#005f7e" padding="16px">
        <mj-column width="15%" vertical-align="middle">
          <mj-image
            src="${this.appBaseUrl}/logo.png"
            href={props.appBaseUrl}
            border-radius="8px"
            width="64px"
            height="64px"
          />
        </mj-column>

        <mj-column width="85%" padding-left="16px" vertical-align="middle">
          <mj-text font-size="32px" line-height="32px" font-weight="bold" color="#ffffff">
            <a href={props.appBaseUrl} style="text-decoration: none; color: inherit">
              SEL'ons-nous
            </a>
          </mj-text>
          <mj-text font-size="14px" color="#ffffff">
            Système d'Échange Local de Cavaillon et ses environs
          </mj-text>
        </mj-column>
      </mj-section>
    `;
  }

  private renderSection(content: string, padding = '8px 0') {
    return `
      <mj-section padding="${padding}">
        <mj-column>
          ${content}
        </mj-column>
      </mj-section>
    `;
  }
}
