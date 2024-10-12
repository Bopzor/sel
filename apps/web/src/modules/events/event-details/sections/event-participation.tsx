import { Event, type EventParticipation } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/outline';
import { JSX } from 'solid-js';

import { Button } from '../../../../components/button';
import { container } from '../../../../infrastructure/container';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';
import { getAuthenticatedMember } from '../../../../utils/authenticated-member';
import { createAsyncCall } from '../../../../utils/create-async-call';

const T = Translate.prefix('events.details');

export function EventParticipation(props: { event: Event; onParticipationChanged: () => void }) {
  return (
    <div>
      <h2 class="mb-4">
        <T id="participationTitle" />
      </h2>

      <div class="row gap-4">
        <ParticipationButton event={props.event} participation="yes" onChanged={props.onParticipationChanged}>
          <Icon path={check} class="text-green size-5 stroke-2" />
          <T id="participates" />
        </ParticipationButton>

        <ParticipationButton event={props.event} participation="no" onChanged={props.onParticipationChanged}>
          <Icon path={xMark} class="text-red size-5 stroke-2" />
          <T id="dontParticipate" />
        </ParticipationButton>
      </div>
    </div>
  );
}

type ParticipationButtonProps = {
  event: Event;
  participation: EventParticipation;
  onChanged: () => void;
  children: JSX.Element;
};

function ParticipationButton(props: ParticipationButtonProps) {
  const api = container.resolve(TOKENS.api);

  const authenticatedMember = getAuthenticatedMember();
  const memberParticipation = () =>
    props.event.participants.find(hasProperty('id', authenticatedMember()?.id as string));
  const isMemberParticipation = () => props.participation === memberParticipation()?.participation;

  const [setParticipation, loading] = createAsyncCall(api.setParticipation.bind(api), {
    onSuccess: () => props.onChanged(),
  });

  const onClick = () => {
    const participation =
      props.participation === memberParticipation()?.participation ? null : props.participation;

    setParticipation({
      path: { eventId: props.event.id },
      body: { participation },
    });
  };

  return (
    <Button
      variant="secondary"
      onClick={onClick}
      loading={loading()}
      class="row items-center gap-1 bg-neutral"
      classList={{
        'border-green': isMemberParticipation() && props.participation === 'yes',
        'border-red': isMemberParticipation() && props.participation === 'no',
        'grayscale opacity-75': memberParticipation() && !isMemberParticipation(),
      }}
    >
      {props.children}
    </Button>
  );
}
