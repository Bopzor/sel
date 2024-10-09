import { DomainEvent, events } from './infrastructure/events';
import { generateId } from './infrastructure/generator';
import { logger } from './infrastructure/logger';
import { db } from './persistence/database';
import { domainEvents } from './persistence/schema/domain-events';
import { server } from './server';

export function application() {
  events.addGlobalListener(storeDomainEvent);

  return server();
}

async function storeDomainEvent(event: DomainEvent<unknown>) {
  try {
    await db.insert(domainEvents).values({
      id: generateId(),
      ...event,
    });
  } catch (error) {
    logger.error(error);
  }
}
