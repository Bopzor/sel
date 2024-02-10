import { Request, RequestStatus, type RequestAnswer } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/outline';
import { JSX, createMemo } from 'solid-js';

import { isAuthenticatedMember } from '../../../../app-context';
import { Button } from '../../../../components/button';
import { container } from '../../../../infrastructure/container';
import { NotificationType } from '../../../../infrastructure/notifications/notifications.port';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';
import { createAsyncCall } from '../../../../utils/create-async-call';
import { notify } from '../../../../utils/notify';

const T = Translate.prefix('requests.answer');

export function RequestAnswer(props: { request: Request; onAnswerChanged: () => void }) {
  return (
    <div>
      <h2 class="mb-4">
        <T id="title" />
      </h2>

      <div class="row gap-4">
        <AnswerButton request={props.request} answer="positive" onAnswerChanged={props.onAnswerChanged}>
          <Icon path={check} class="text-green size-5 stroke-2" />
          <T id="positive" />
        </AnswerButton>

        <AnswerButton request={props.request} answer="negative" onAnswerChanged={props.onAnswerChanged}>
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
  onAnswerChanged: () => void;
  children: JSX.Element;
};

function AnswerButton(props: AnswerButtonProps) {
  const requestApi = container.resolve(TOKENS.requestApi);

  const memberAnswer = createMemo(() => {
    return props.request.answers.find((answer) => isAuthenticatedMember(answer.member))?.answer;
  });

  const isMemberAnswer = () => {
    return memberAnswer() === props.answer;
  };

  const [setAnswer, loading] = createAsyncCall(requestApi.setAnswer.bind(requestApi), {
    onSuccess: props.onAnswerChanged,
  });

  const onClick = () => {
    if (props.request.status !== RequestStatus.pending) {
      notify(NotificationType.info, <T id="requestIsNotPending" />);
      return;
    }

    if (props.answer === memberAnswer()) {
      setAnswer(props.request.id, null);
    } else {
      setAnswer(props.request.id, props.answer);
    }
  };

  return (
    <Button
      variant="secondary"
      class="row items-center gap-1 bg-neutral"
      onClick={onClick}
      classList={{
        'border-green': isMemberAnswer() && props.answer === 'positive',
        'border-red': isMemberAnswer() && props.answer === 'negative',
        'grayscale opacity-75': memberAnswer() && !isMemberAnswer(),
      }}
      loading={loading()}
    >
      {props.children}
    </Button>
  );
}
