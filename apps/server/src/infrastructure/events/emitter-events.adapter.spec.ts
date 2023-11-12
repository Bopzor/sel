import { waitFor } from '@sel/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DomainEvent } from '../../domain-event';
import { UnitTest } from '../../unit-test';
import { StubLogger } from '../logger/stub-logger.adapter';

import { EmitterEventsAdapter } from './emitter-events.adapter';

class Test extends UnitTest {
  logger = new StubLogger();
  adapter = new EmitterEventsAdapter(this.logger);
}

describe('EmitterEventsAdapter', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  class TestEvent1 extends DomainEvent {
    entity = 'test';
  }

  class TestEvent2 extends DomainEvent {
    entity = 'test';
  }

  it('registers listeners and triggers events', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();

    test.adapter.addEventListener(TestEvent1, listener1);
    test.adapter.addEventListener(TestEvent1, listener2);
    test.adapter.addEventListener(TestEvent2, listener3);

    const event = new TestEvent1('');

    test.adapter.emit(event);

    expect(listener1).toHaveBeenCalledWith(event);
    expect(listener2).toHaveBeenCalledWith(event);
    expect(listener3).not.toHaveBeenCalled();
  });

  it('registers listeners on any event', () => {
    const listener = vi.fn();
    const event = new TestEvent1('');

    test.adapter.addAnyEventListener(listener);
    test.adapter.emit(event);

    expect(listener).toHaveBeenCalledWith(event);
  });

  it('logs errors thrown by a listener', () => {
    const error = new Error('oops');

    test.adapter.addEventListener(TestEvent1, () => {
      throw error;
    });

    test.adapter.emit(new TestEvent1(''));

    expect(test.logger.lines.error).toContainEqual(error);
  });

  it('logs errors thrown by an async listener', async () => {
    const error = new Error('oops');

    test.adapter.addEventListener(TestEvent1, async () => {
      throw error;
    });

    test.adapter.emit(new TestEvent1(''));

    await waitFor(() => {
      expect(test.logger.lines.error).toContainEqual(error);
    });
  });
});
