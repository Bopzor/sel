import { Event, type EventParticipation } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/outline';
import { JSX } from 'solid-js';

import { authenticatedMember } from '../../../../app-context';
import { Button } from '../../../../components/button';
import { container } from '../../../../infrastructure/container';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';
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
  const eventApi = container.resolve(TOKENS.eventApi);

  const member = authenticatedMember();
  const memberParticipation = () => props.event.participants.find(hasProperty('id', member?.id as string));
  const isMemberParticipation = () => props.participation === memberParticipation()?.participation;

  const [setParticipation, loading] = createAsyncCall(eventApi.setParticipation.bind(eventApi), {
    onSuccess: props.onChanged,
  });

  const onClick = () => {
    if (props.participation === memberParticipation()?.participation) {
      setParticipation(props.event.id, null);
    } else {
      setParticipation(props.event.id, props.participation);
    }
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
