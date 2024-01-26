import { injectableClass } from 'ditox';

import { OnboardingCompleted } from '../../members/member-events';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';
import { SlackClientPort } from '../slack/slack-client.port';

import { EventsPort } from './events.port';

export class EventsSlackPublisher {
  static inject = injectableClass(this, TOKENS.events, TOKENS.slackClient, TOKENS.memberRepository);

  constructor(
    private readonly events: EventsPort,
    private readonly slackClient: SlackClientPort,
    private readonly memberRepository: MemberRepository
  ) {}

  init() {
    this.events.addEventListener(OnboardingCompleted, this.notifyOnboardingCompleted.bind(this));
  }

  async notifyOnboardingCompleted(event: OnboardingCompleted) {
    const member = await this.memberRepository.getMember(event.entityId);
    const text = `${member?.firstName} ${member?.lastName} completed their onboarding`;

    await this.slackClient.send(text);
  }
}
