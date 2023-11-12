import { assert, expect } from 'vitest';

import { DomainEvent } from './domain-event';
import { StubEventsAdapter } from './infrastructure/events/stub-events.adapter';

interface CustomMatchers<R = unknown> {
  toHaveEmitted(event: DomainEvent): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toHaveEmitted(events: StubEventsAdapter, expected: DomainEvent) {
    let error: Error | undefined = undefined;
    let assertion = expect(events.events);

    if (this.isNot) {
      assertion = assertion.not;
    }

    try {
      assertion.toContainEqual(expected);
    } catch (err) {
      assert(err instanceof Error);
      error = err;
    }

    return {
      pass: error === undefined,
      message: () => {
        assert(error);
        return [
          error.message,
          `received: ${this.utils.printReceived(events.events)}`,
          `expected: ${this.utils.printExpected(expected)}`,
        ].join('\n');
      },
    };
  },
});
