import { DomainEvent, events } from './infrastructure/events';
import { generateId } from './infrastructure/generator';
import { logger } from './infrastructure/logger';
import { db } from './persistence/database';
import { domainEvents } from './persistence/schema/domain-events';

export function initialize() {
  events.addGlobalListener(storeDomainEvent);
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
