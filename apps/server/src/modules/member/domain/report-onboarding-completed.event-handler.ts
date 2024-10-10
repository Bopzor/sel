import { defined } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';

import { OnboardingCompletedEvent } from '../member.entities';
import { findMemberById } from '../member.persistence';

export async function reportOnboardingCompleted(event: OnboardingCompletedEvent) {
  const slackClient = container.resolve(TOKENS.slackClient);

  const member = defined(await findMemberById(event.entityId));
  const text = `${member?.firstName} ${member?.lastName} completed their onboarding`;

  await slackClient.send(text);
}
