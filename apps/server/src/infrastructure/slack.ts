import { injectableClass } from 'ditox';

import { TOKENS } from 'src/tokens';

import { Config } from './config';

export interface SlackClient {
  send(message: string): Promise<void>;
}

export class WebSlackClientAdapter implements SlackClient {
  static inject = injectableClass(this, TOKENS.config);

  constructor(private readonly config: Config) {}

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
