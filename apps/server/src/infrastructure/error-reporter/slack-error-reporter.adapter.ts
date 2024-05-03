import { inspect } from 'node:util';

import { injectableClass } from 'ditox';

import { DomainError } from '../../domain-error';
import { TOKENS } from '../../tokens';
import { SlackClientPort } from '../slack/slack-client.port';

import { ErrorReporterPort } from './error-reporter.port';

export class SlackErrorReporterAdapter implements ErrorReporterPort {
  static inject = injectableClass(this, TOKENS.slackClient);

  constructor(private readonly slackClient: SlackClientPort) {}

  async report(...args: unknown[]): Promise<void> {
    await this.slackClient.send(this.getMessage(args));
  }

  private getMessage(args: unknown[]) {
    return args.map(this.stringify).join('\n');
  }

  private stringify(this: void, value: unknown) {
    const code = (value: string) => `\`\`\`${value}\`\`\``;

    if (value instanceof DomainError) {
      return [value.stack, code(inspect({ payload: value.payload }))].join('\n');
    } else if (value instanceof Error) {
      return value.stack;
    } else if (typeof value === 'object') {
      return code(inspect(value));
    } else {
      return String(value);
    }
  }
}
