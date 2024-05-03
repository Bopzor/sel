import { beforeEach, describe, expect, it } from 'vitest';

import { UnitTest } from '../../unit-test';
import { StubSlackClientAdapter } from '../slack/stub-slack-client.adapter';

import { SlackErrorReporterAdapter } from './slack-error-reporter.adapter';

class Test extends UnitTest {
  slackClient = new StubSlackClientAdapter();
  reporter = new SlackErrorReporterAdapter(this.slackClient);

  error = new Error('Oops');
}

describe('SlackErrorReporterAdapter', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('reports an error', async () => {
    await test.reporter.report(test.error);

    expect(test.slackClient.messages).toContainEqual(expect.stringMatching(/^Error: Oops\n/));
  });

  it('reports an error with some context', async () => {
    await test.reporter.report('Oh no', { abc: 42 }, test.error);

    expect(test.slackClient.messages).toContainEqual(
      expect.stringMatching(/^Oh no\n```{ abc: 42 }```\nError: Oops\n/),
    );
  });
});
