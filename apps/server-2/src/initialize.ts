import { container } from './infrastructure/container';
import { DomainEvent, events } from './infrastructure/events';
import { AuthenticationLinkRequestedEvent } from './modules/authentication/authentication.entities';
import { sendAuthenticationEmail } from './modules/authentication/send-authentication-link.event-handler';
import { db } from './persistence/database';
import { domainEvents } from './persistence/schema/domain-events';
import { TOKENS } from './tokens';

export function initialize() {
  container.resolve(TOKENS.pushNotification).init?.();

  events.addGlobalListener(storeDomainEvent);
  events.addListener(AuthenticationLinkRequestedEvent, sendAuthenticationEmail);
}

async function storeDomainEvent(event: DomainEvent<unknown>) {
  const generator = container.resolve(TOKENS.generator);
  const logger = container.resolve(TOKENS.logger);

  try {
    await db.insert(domainEvents).values({
      id: generator.id(),
      ...event,
    });
  } catch (error) {
    logger.error(error);
  }
}
