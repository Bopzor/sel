import { injectableClass } from 'ditox';

import { OnboardingCompleted } from '../../members/events';
import { MembersFacade } from '../../members/members.facade';
import { TOKENS } from '../../tokens';
import { SlackClientPort } from '../slack/slack-client.port';

import { EventsPort } from './events.port';

export class EventsSlackPublisher {
  static inject = injectableClass(this, TOKENS.events, TOKENS.slackClient, TOKENS.membersFacade);

  constructor(
    private readonly events: EventsPort,
    private readonly slackClient: SlackClientPort,
    private readonly memberFacade: MembersFacade
  ) {}

  init() {
    this.events.addEventListener(OnboardingCompleted, this.notifyOnboardingCompleted.bind(this));
  }

  async notifyOnboardingCompleted(event: OnboardingCompleted) {
    const member = await this.memberFacade.getMember(event.entityId);
    const text = `${member?.firstName} ${member?.lastName} completed their onboarding`;

    await this.slackClient.send(text);
  }
}
