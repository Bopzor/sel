import { Interest } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { chevronRight, plus } from 'solid-heroicons/solid';
import { Show, For, createSignal } from 'solid-js';

import { isAuthenticatedMember } from '../../../app-context';
import { Button } from '../../../components/button';
import { Collapse } from '../../../components/collapse';
import { Link } from '../../../components/link';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';

const T = Translate.prefix('interests');

export function InterestItem(props: { interest: Interest }) {
  const [expanded, setExpanded] = createSignal(false);

  return (
    <>
      <Header
        interest={props.interest}
        expanded={expanded()}
        toggleExpanded={() => setExpanded(!expanded())}
      />

      <Collapse open={expanded()}>
        <ul class="col gap-2 pb-6 ps-8">
          <For
            each={props.interest.members}
            fallback={
              <span class="text-center text-dim">
                <T id="noMembers" />
              </span>
            }
          >
            {(member) => (
              <li class="row items-start gap-4">
                <Link
                  unstyled
                  class="row min-w-48 items-center gap-2 whitespace-nowrap"
                  href={routes.members.member(member.id)}
                >
                  <MemberAvatarName member={member} />
                </Link>

                <p class="flex-1 italic">{member.description}</p>
              </li>
            )}
          </For>
        </ul>
      </Collapse>
    </>
  );
}

function Header(props: { interest: Interest; expanded: boolean; toggleExpanded: () => void }) {
  const hasJoined = () => {
    return props.interest.members.some(isAuthenticatedMember);
  };

  return (
    <div class="row items-center justify-between gap-2">
      <div
        role="button"
        class="row flex-1 cursor-pointer items-center gap-4 py-6"
        onClick={() => props.toggleExpanded()}
      >
        <Icon
          path={chevronRight}
          class="size-6 transition-transform"
          classList={{ 'rotate-90': props.expanded }}
        />

        <div class="col gap-1">
          <div class="row items-center gap-2">
            <div class="text-xl font-semibold">{props.interest.label}</div>

            <div class="text-sm text-dim">
              <T id="membersCount" values={{ count: props.interest.members.length }} />
            </div>
          </div>

          <p class="text-dim">{props.interest.description}</p>
        </div>
      </div>

      <Show when={!hasJoined()} fallback={<div />}>
        <Button variant="secondary">
          <Icon path={plus} class="size-em" />
          <T id="add" />
        </Button>
      </Show>
    </div>
  );
}
