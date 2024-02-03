import { Request } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { check, xMark } from 'solid-heroicons/outline';
import { For, Show } from 'solid-js';

import { Link } from '../../components/link';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';

const T = Translate.prefix('requests.answersList');

type AnswersListProps = {
  request?: Request;
};

export const AnswersList = (props: AnswersListProps) => {
  return (
    <Show
      when={(props.request?.answers.length ?? 0) > 0}
      fallback={
        <div class="fallback">
          <T id="empty" />
        </div>
      }
    >
      <For each={props.request?.answers}>
        {(answer) => (
          <Link unstyled href={routes.members.member(answer.member.id)} class="row items-center gap-2">
            <T id="answered" values={{ member: <MemberAvatarName member={answer.member} /> }} />

            <div
              class="row items-center justify-end gap-2 font-medium"
              classList={{
                'text-green': answer.answer === 'positive',
                'text-dim': answer.answer === 'negative',
              }}
            >
              <Show when={answer.answer === 'positive'}>
                <T id="positive" />
                <Icon path={check} class="size-5 stroke-2" />
              </Show>

              <Show when={answer.answer === 'negative'}>
                <T id="negative" />
                <Icon path={xMark} class="size-5 stroke-2" />
              </Show>
            </div>
          </Link>
        )}
      </For>
    </Show>
  );
};
