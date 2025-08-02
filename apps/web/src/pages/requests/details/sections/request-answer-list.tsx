import { Request, RequestAnswer } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/solid';
import { For } from 'solid-js';

import { card, Card } from 'src/components/card';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { TranslateRequestAnswer } from 'src/intl/enums';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.requests.details.answerList');

export function RequestAnswerList(props: { request: Request }) {
  return (
    <Card title={<T id="title" />}>
      <ul class="col gap-4">
        <For
          each={props.request.answers}
          fallback={
            <div class={card.fallback()}>
              <T id="empty" />
            </div>
          }
        >
          {(answer) => (
            <li class="row flex-wrap items-center gap-2">
              <Answer answer={answer} />
            </li>
          )}
        </For>
      </ul>
    </Card>
  );
}

function Answer(props: { answer: RequestAnswer }) {
  const negative = () => props.answer.answer === 'negative';
  const positive = () => props.answer.answer === 'positive';

  return (
    <T
      id="answered"
      values={{
        member: <MemberAvatarName short member={props.answer.member} />,
        answer: (
          <div
            class="row items-center justify-end gap-2 font-medium"
            classList={{
              'text-emerald-700': positive(),
              'text-dim': negative(),
            }}
          >
            <TranslateRequestAnswer value={props.answer.answer} />
            <Icon path={{ positive: check, negative: xMark }[props.answer.answer]} class="size-5 stroke-2" />
          </div>
        ),
      }}
    />
  );
}
