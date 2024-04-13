import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { GeneratorPort } from '../../infrastructure/generator/generator.port';
import { SubscriptionRepository } from '../../persistence/repositories/subscription/subscription.repository';
import { TOKENS } from '../../tokens';
import { SubscriptionCreated } from '../subscription-events';
import { SubscriptionType } from '../subscription.entity';

export type CreateSubscriptionCommand = {
  subscriptionId?: string;
  type: SubscriptionType;
  memberId: string;
  entityId?: string;
  active?: boolean;
};

export class CreateSubscription implements CommandHandler<CreateSubscriptionCommand> {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.eventPublisher,
    TOKENS.subscriptionRepository,
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async handle({
    subscriptionId = this.generator.id(),
    type,
    memberId,
    entityId,
    active,
  }: CreateSubscriptionCommand): Promise<void> {
    if (await this.subscriptionRepository.hasSubscription(type, memberId, entityId)) {
      return;
    }

    await this.subscriptionRepository.insert({
      id: subscriptionId,
      type,
      memberId,
      entityId,
      active,
    });

    this.eventPublisher.publish(new SubscriptionCreated(subscriptionId));
  }
}
