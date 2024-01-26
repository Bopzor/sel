import { injectableClass } from 'ditox';

import { DomainEvent } from '../../domain-event';
import { OnboardingCompleted } from '../../members/member-events';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';
import { EventHandler } from '../cqs/event-handler';
import { SlackClientPort } from '../slack/slack-client.port';

export class EventsSlackPublisher implements EventHandler<DomainEvent> {
  static inject = injectableClass(this, TOKENS.slackClient, TOKENS.memberRepository);

  constructor(
    private readonly slackClient: SlackClientPort,
    private readonly memberRepository: MemberRepository
  ) {}

  async handle(event: DomainEvent) {
    if (event instanceof OnboardingCompleted) {
      const member = await this.memberRepository.getMember(event.entityId);
      const text = `${member?.firstName} ${member?.lastName} completed their onboarding`;

      await this.slackClient.send(text);
    }
  }
}
