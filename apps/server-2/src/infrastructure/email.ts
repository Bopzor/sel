import { injectableClass } from 'ditox';
import mjml2html from 'mjml';

import { TOKENS } from 'src/tokens';

import { Config } from './config';
import { Logger } from './logger';

export type Email = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export interface EmailRenderer {
  render(props: { subject: string; html: string[]; text: string[] }): Omit<Email, 'to'>;
  renderHtml(preview: string, html: string): string;
  renderText(text: string): string;
  userContent(children: string): string;
}

export class MjmlEmailRenderer implements EmailRenderer {
  static inject = injectableClass(this, TOKENS.config, TOKENS.logger);

  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
  ) {}

  render(props: { subject: string; html: string[]; text: string[] }): Omit<Email, 'to'> {
    const { subject, html, text } = props;
    const result = mjml2html(this.renderEmail(subject, html));

    if (result.errors.length > 0) {
      this.logger.warn(result.errors.map((error) => error.formattedMessage).join('\n'));
    }

    return {
      subject,
      text: text.join('\n\n'),
      html: result.html,
    };
  }

  renderHtml(preview: string, html: string): string {
    const result = mjml2html(this.renderEmail(preview, [html]));

    if (result.errors.length > 0) {
      this.logger.warn(result.errors.map((error) => error.formattedMessage).join('\n'));
    }

    return result.html;
  }

  renderText(text: string): string {
    return text
      .replaceAll('**', '')
      .replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => `${text} (${href})`)
      .replaceAll(/\n> (.+)/g, (_, text) => `\n${text}`);
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
      blockquote {
        margin: 0;
        padding: 8px 16px;
        border: 1px solid #CCC;
        border-radius: 4px;
        background: #fafafc;
      }

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

export interface EmailSender {
  send(email: Email): Promise<void>;
}

type TransportOptions = {
  port: number;
  host: string;
  secure: boolean;
  auth: {
    type: 'login';
    user: string;
    pass: string;
  };
};

type MessageConfiguration = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

type Transporter = {
  sendMail(message: MessageConfiguration, cb: (err: Error | undefined) => void): void;
};

export interface Nodemailer {
  createTransport(transport: TransportOptions): Transporter;
}

export class NodemailerEmailSender implements EmailSender {
  static inject = injectableClass(this, TOKENS.config, TOKENS.nodemailer);

  private transporter: Transporter;
  private from: string;

  constructor(config: Config, nodemailer: Nodemailer) {
    this.from = config.email.sender;

    console.log({
      port: config.email.port,
      host: config.email.host,
      secure: config.email.secure,
      auth: {
        type: 'login',
        user: config.email.sender,
        pass: config.email.password,
      },
    });

    this.transporter = nodemailer.createTransport({
      port: config.email.port,
      host: config.email.host,
      secure: config.email.secure,
      auth: {
        type: 'login',
        user: config.email.sender,
        pass: config.email.password,
      },
    });
  }

  async send({ to, subject, text, html }: Email): Promise<void> {
    const message: MessageConfiguration = {
      from: this.from,
      to,
      subject,
      text,
      html,
    };

    return new Promise<void>((resolve, reject) => {
      this.transporter.sendMail(message, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export class StubEmailSender implements EmailSender {
  public readonly emails: Email[] = [];

  async send(email: Email): Promise<void> {
    this.emails.push(email);
  }
}
