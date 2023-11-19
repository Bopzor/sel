import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { SlackClientPort } from './slack-client.port';

export class WebSlackClientAdapter implements SlackClientPort {
  static inject = injectableClass(this, TOKENS.config);

  constructor(private readonly config: ConfigPort) {}

  async send(message: string): Promise<void> {
    const webhookUrl = this.config.slack.webhookUrl;

    if (!webhookUrl) {
      return;
    }

    const headers = new Headers();

    headers.set('Content-type', 'application/json');

    await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text: message }),
    });
  }
}
