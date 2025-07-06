import { Event, EventParticipation as EventParticipationEnum } from '@sel/shared';
import { createMutation } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/solid';
import { JSX } from 'solid-js';

import { api } from 'src/application/api';
import { getIsAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { Card } from 'src/components/card';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.details.participation');

export function EventParticipation(props: { event: Event }) {
  return (
    <Card title={<T id="title" />} class="row justify-center gap-4 py-8">
      <AnswerButton
        event={props.event}
        answer="yes"
        start={<Icon path={check} class="size-6 text-emerald-600" />}
      >
        <T id="yes" />
      </AnswerButton>

      <AnswerButton
        event={props.event}
        answer="no"
        start={<Icon path={xMark} class="size-6 text-gray-600" />}
      >
        <T id="no" />
      </AnswerButton>
    </Card>
  );
}

type AnswerButtonProps = {
  event: Event;
  answer: EventParticipationEnum;
  start?: JSX.Element;
  children: JSX.Element;
};

function AnswerButton(props: AnswerButtonProps) {
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const memberAnswer = () => {
    return props.event.participants.find((participant) => isAuthenticatedMember(participant))?.participation;
  };

  const isMemberAnswer = () => {
    return memberAnswer() === props.answer;
  };

  const mutation = createMutation(() => ({
    async mutationFn(participation: EventParticipationEnum | null) {
      await api.setEventParticipation({ path: { eventId: props.event.id }, body: { participation } });
    },
    async onSuccess() {
      await invalidate('getEvent', { path: { eventId: props.event.id } });
    },
  }));

  const onClick = () => {
    if (props.answer === memberAnswer()) {
      mutation.mutate(null);
    } else {
      mutation.mutate(props.answer);
    }
  };

  return (
    <Button
      variant="outline"
      loading={mutation.isPending}
      onClick={onClick}
      start={props.start}
      class="row items-center gap-1 bg-neutral"
      classList={{
        'border-emerald-600': isMemberAnswer() && props.answer === 'yes',
        'border-gray-600': isMemberAnswer() && props.answer === 'no',
        'grayscale opacity-75': memberAnswer() && !isMemberAnswer(),
      }}
    >
      {props.children}
    </Button>
  );
}
