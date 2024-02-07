import { RequestAnswer } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/solid';
import { For, Show } from 'solid-js';

import { Link } from '../../../../components/link';
import { MemberAvatarName } from '../../../../components/member-avatar-name';
import { Translate } from '../../../../intl/translate';
import { routes } from '../../../../routes';

const T = Translate.prefix('requests.answersList');

export function RequestAnswersList(props: { answers: RequestAnswer[] }) {
  return (
    <div class="col gap-4">
      <h2>
        <T id="title" />
      </h2>

      <Show
        when={props.answers.length > 0}
        fallback={
          <div class="fallback">
            <T id="empty" />
          </div>
        }
      >
        <For each={props.answers}>{(answer) => <Answer answer={answer} />}</For>
      </Show>
    </div>
  );
}

function Answer(props: { answer: RequestAnswer }) {
  const member = () => props.answer.member;

  const negative = () => props.answer.answer === 'negative';
  const positive = () => props.answer.answer === 'positive';

  return (
    <Link unstyled href={routes.members.member(member().id)} class="row items-center gap-2">
      <T id="answered" values={{ member: <MemberAvatarName member={member()} /> }} />

      <div
        class="row items-center justify-end gap-2 font-medium"
        classList={{
          'text-green': positive(),
          'text-dim': negative(),
        }}
      >
        <Show when={positive()}>
          <T id="positive" />
          <Icon path={check} class="size-5 stroke-2" />
        </Show>

        <Show when={negative()}>
          <T id="negative" />
          <Icon path={xMark} class="size-5 stroke-2" />
        </Show>
      </div>
    </Link>
  );
}
