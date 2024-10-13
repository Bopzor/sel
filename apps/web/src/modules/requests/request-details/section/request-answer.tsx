import { Request, type RequestAnswer, RequestStatus } from '@sel/shared';
import { createMutation } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/outline';
import { JSX, createMemo } from 'solid-js';

import { Button } from '../../../../components/button';
import { useInvalidateApi } from '../../../../infrastructure/api';
import { container } from '../../../../infrastructure/container';
import { NotificationType } from '../../../../infrastructure/notifications/notifications.port';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';
import { getIsAuthenticatedMember } from '../../../../utils/authenticated-member';
import { notify } from '../../../../utils/notify';

const T = Translate.prefix('requests.answer');

export function RequestAnswer(props: { request: Request }) {
  return (
    <div>
      <h2 class="mb-4">
        <T id="title" />
      </h2>

      <div class="row gap-4">
        <AnswerButton request={props.request} answer="positive">
          <Icon path={check} class="text-green size-5 stroke-2" />
          <T id="positive" />
        </AnswerButton>

        <AnswerButton request={props.request} answer="negative">
          <Icon path={xMark} class="text-red size-5 stroke-2" />
          <T id="negative" />
        </AnswerButton>
      </div>
    </div>
  );
}

type AnswerButtonProps = {
  request: Request;
  answer: RequestAnswer['answer'];
  children: JSX.Element;
};

function AnswerButton(props: AnswerButtonProps) {
  const api = container.resolve(TOKENS.api);
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const memberAnswer = createMemo(() => {
    return props.request.answers.find((answer) => isAuthenticatedMember(answer.member))?.answer;
  });

  const isMemberAnswer = () => {
    return memberAnswer() === props.answer;
  };

  const mutation = createMutation(() => ({
    async mutationFn(answer: 'positive' | 'negative' | null) {
      await api.setRequestAnswer({ path: { requestId: props.request.id }, body: { answer } });
    },
    async onSuccess() {
      await invalidate(['getRequest', props.request.id]);
    },
  }));

  const onClick = () => {
    if (props.request.status !== RequestStatus.pending) {
      notify(NotificationType.info, <T id="requestIsNotPending" />);
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
      variant="secondary"
      onClick={onClick}
      loading={mutation.isPending}
      class="row items-center gap-1 bg-neutral"
      classList={{
        'border-green': isMemberAnswer() && props.answer === 'positive',
        'border-red': isMemberAnswer() && props.answer === 'negative',
        'grayscale opacity-75': memberAnswer() && !isMemberAnswer(),
      }}
    >
      {props.children}
    </Button>
  );
}
