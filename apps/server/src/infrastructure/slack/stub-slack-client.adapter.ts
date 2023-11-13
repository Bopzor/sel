import { SlackClientPort } from './slack-client.port';

export class StubSlackClientAdapter implements SlackClientPort {
  messages = new Array<string>();

  async send(message: string): Promise<void> {
    this.messages.push(message);
  }
}
