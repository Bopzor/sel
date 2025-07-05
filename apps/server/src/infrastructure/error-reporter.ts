import util from 'node:util';

import { injectableClass } from 'ditox';

import { TOKENS } from 'src/tokens';

import { DomainError } from './domain-error';
import { SlackClient } from './slack';

export interface ErrorReporter {
  report(...args: unknown[]): Promise<void>;
}

export class SlackErrorReporter implements ErrorReporter {
  static inject = injectableClass(this, TOKENS.slackClient);

  constructor(private readonly slackClient: SlackClient) {}

  async report(...args: unknown[]): Promise<void> {
    await this.slackClient.send(this.getMessage(args));
  }

  private getMessage(args: unknown[]) {
    return args.map(this.stringify).join('\n');
  }

  private stringify(this: void, value: unknown) {
    const code = (value: string) => '```' + value + '```';

    if (value instanceof DomainError) {
      return [value.stack, code(util.inspect({ payload: value.payload }))].join('\n');
    } else if (value instanceof Error) {
      return value.stack;
    } else if (typeof value === 'object') {
      return code(util.inspect(value));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return String(value);
    }
  }
}

export class TestErrorReporter implements ErrorReporter {
  async report(...args: unknown[]): Promise<void> {
    if (args[0] instanceof Error) {
      throw Object.assign(args[0]);
    } else {
      throw Object.assign(new Error('An error was reported during tests'), { args });
    }
  }
}
