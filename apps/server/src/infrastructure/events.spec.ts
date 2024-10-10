import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestErrorReporter } from './error-reporter';
import { DomainEvent, EmitterEvents } from './events';
import { StubLogger } from './logger';

class TestEvent extends DomainEvent {
  public entity = 'test';
}

describe('Events', () => {
  let logger: StubLogger;
  let events: EmitterEvents;

  const event = new TestEvent('1');

  beforeEach(() => {
    logger = new StubLogger();
    events = new EmitterEvents(logger, new TestErrorReporter());
  });

  it('triggers listeners when an event is emitted', () => {
    const listener = vi.fn();

    events.addListener(TestEvent, listener);
    events.publish(event);

    expect(listener).toHaveBeenCalledWith(event);
  });

  it('triggers global listeners when an event is emitted', () => {
    const listener = vi.fn();

    events.addGlobalListener(listener);
    events.publish(event);

    expect(listener).toHaveBeenCalledWith(event);
  });

  it('waits for all listeners', async () => {
    const done = vi.fn();
    const listener = vi.fn(() => new Promise<void>((r) => setTimeout(r, 1)).then(done));

    events.addListener(TestEvent, listener);
    events.publish(event);

    await events.waitForListeners();

    expect(done).toHaveBeenCalled();
  });

  it('logs a message when an event listener throws', async () => {
    const error = new Error('test');
    const listener = vi.fn().mockRejectedValue(error);

    events.addListener(TestEvent, listener);
    events.publish(event);
    await events.waitForListeners();

    expect(logger.lines.error).toContainEqual([
      `Error in event listener ${listener.name}`,
      expect.stringContaining(error.message),
    ]);
  });
});
