import { Request, type RequestAnswer, RequestStatus } from '@sel/shared';
import { createMutation } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/solid';
import { JSX, Show } from 'solid-js';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { getAuthenticatedMember, getIsAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { Card } from 'src/components/card';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.requests.details.answer');

export function RequestAnswer(props: { request: Request }) {
  const member = getAuthenticatedMember();

  return (
    <Show when={props.request.requester.id !== member()?.id}>
      <Card title={<T id="title" />} class="row  justify-center gap-4 py-8">
        <AnswerButton
          request={props.request}
          answer="positive"
          start={<Icon path={check} class="size-6 text-green-600" />}
        >
          <T id="positive" />
        </AnswerButton>

        <AnswerButton
          request={props.request}
          answer="negative"
          start={<Icon path={xMark} class="size-6 text-gray-600" />}
        >
          <T id="negative" />
        </AnswerButton>
      </Card>
    </Show>
  );
}

type AnswerButtonProps = {
  request: Request;
  answer: RequestAnswer['answer'];
  start?: JSX.Element;
  children: JSX.Element;
};

function AnswerButton(props: AnswerButtonProps) {
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const memberAnswer = () => {
    return props.request.answers.find((answer) => isAuthenticatedMember(answer.member))?.answer;
  };

  const isMemberAnswer = () => {
    return memberAnswer() === props.answer;
  };

  const mutation = createMutation(() => ({
    async mutationFn(answer: 'positive' | 'negative' | null) {
      await api.setRequestAnswer({ path: { requestId: props.request.id }, body: { answer } });
    },
    async onSuccess() {
      await invalidate('getRequest', { path: { requestId: props.request.id } });
    },
  }));

  const onClick = () => {
    if (props.request.status !== RequestStatus.pending) {
      notify.info(<T id="requestIsNotPending" />);
      return;
    }

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
        'border-green-600': isMemberAnswer() && props.answer === 'positive',
        'border-gray-600': isMemberAnswer() && props.answer === 'negative',
        'grayscale opacity-75': memberAnswer() && !isMemberAnswer(),
      }}
    >
      {props.children}
    </Button>
  );
}
