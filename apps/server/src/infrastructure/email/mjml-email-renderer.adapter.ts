import fs from 'node:fs/promises';

import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { EmailRendererPort } from './email-renderer.port';
import { EmailKind, EmailVariables } from './email.types';

export class MjmlEmailRendererAdapter implements EmailRendererPort {
  static inject = injectableClass(this, TOKENS.config);

  private templates = new Map<EmailKind, (variables: unknown) => [text: string, html: string]>();
  private commonVariables: Record<string, string> = {};

  constructor(private readonly config: ConfigPort) {
    this.commonVariables['appBaseUrl'] = config.app.baseUrl;
  }

  async init() {
    const templatesPath = this.config.email.templatesPath;

    for (const kind of Object.values(EmailKind)) {
      const textRenderer = await this.loadTextRenderer(`${templatesPath}/${kind}.txt`);
      const htmlRenderer = await this.loadHtmlRenderer(`${templatesPath}/${kind}.mjml`);

      this.templates.set(kind, (variables) => [textRenderer(variables), htmlRenderer(variables)]);
    }
  }

  private async loadTextRenderer(path: string) {
    const textTemplate = String(await fs.readFile(path));

    return Handlebars.compile(textTemplate);
  }

  private async loadHtmlRenderer(path: string) {
    const mjmlTemplate = String(await fs.readFile(path));
    const htmlTemplate = mjml2html(mjmlTemplate);

    if (htmlTemplate.errors.length > 0) {
      throw htmlTemplate.errors;
    }

    return Handlebars.compile(htmlTemplate.html);
  }

  render<Kind extends EmailKind>(
    kind: EmailKind,
    variables: EmailVariables[Kind]
  ): [text: string, html: string] {
    const renderer = defined(this.templates.get(kind), `Missing renderer for ${kind} email`);

    return renderer({
      ...this.commonVariables,
      ...variables,
    });
  }
}
