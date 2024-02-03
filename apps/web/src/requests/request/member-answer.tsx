import { Request } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/outline';

import { Button } from '../../components/button';
import { Translate } from '../../intl/translate';
import { getAppActions, select, selectRequestMemberAnswer } from '../../store/app-store';

const T = Translate.prefix('requests.answer');

type MemberAnswerProps = {
  request?: Request;
};

export const MemberAnswer = (props: MemberAnswerProps) => {
  const { setRequestAnswer } = getAppActions();
  const memberAnswer = select(selectRequestMemberAnswer);

  const setAnswer = (answer: 'positive' | 'negative') => {
    if (answer === memberAnswer()) {
      void setRequestAnswer(props.request?.id ?? '', null);
    } else {
      void setRequestAnswer(props.request?.id ?? '', answer);
    }
  };

  return (
    <div class="row gap-4">
      <Button
        variant="secondary"
        class="row items-center gap-1 bg-neutral"
        onClick={() => setAnswer('positive')}
        classList={{
          'border-green': memberAnswer() === 'positive',
          'grayscale opacity-75': memberAnswer() === 'negative',
        }}
      >
        <Icon path={check} class="text-green size-5 stroke-2" />
        <T id="positive" />
      </Button>

      <Button
        variant="secondary"
        class="row items-center gap-1 bg-neutral"
        classList={{
          'border-red': memberAnswer() === 'negative',
          'grayscale opacity-75': memberAnswer() === 'positive',
        }}
        onClick={() => setAnswer('negative')}
      >
        <Icon path={xMark} class="text-red size-5 stroke-2" />
        <T id="negative" />
      </Button>
    </div>
  );
};
