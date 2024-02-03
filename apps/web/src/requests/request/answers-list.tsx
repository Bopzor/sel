import { Request } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { check } from 'solid-heroicons/outline';
import { xMark } from 'solid-heroicons/outline';
import { For, Show } from 'solid-js';

import { MemberAvatarName } from '../../components/member-avatar-name';
import { Translate } from '../../intl/translate';

const T = Translate.prefix('requests');

type AnswersListProps = {
  request?: Request;
};

export const AnswersList = (props: AnswersListProps) => {
  return (
    <For each={props.request?.answers}>
      {(answer) => (
        <div class="row items-center gap-2">
          <MemberAvatarName member={answer.member} />

          <div
            class="row ml-auto w-24 items-center justify-end gap-2 font-medium"
            classList={{
              'text-green': answer.answer === 'positive',
              'text-dim': answer.answer === 'negative',
            }}
          >
            <Show when={answer.answer === 'positive'}>
              <T id="answersList.positive" />
              <Icon path={check} class="size-5 stroke-2" />
            </Show>

            <Show when={answer.answer === 'negative'}>
              <T id="answersList.negative" />
              <Icon path={xMark} class="size-5 stroke-2" />
            </Show>
          </div>
        </div>
      )}
    </For>
  );
};
