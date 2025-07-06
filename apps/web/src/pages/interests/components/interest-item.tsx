import { Interest, InterestMember } from '@sel/shared';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { pencil } from 'solid-heroicons/solid';
import { For, Show, createSignal } from 'solid-js';

import { getIsAuthenticatedMember } from 'src/application/query';
import { Button } from 'src/components/button';
import { CardFallback } from 'src/components/card';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { createTranslate } from 'src/intl/translate';

import { InterestDescriptionForm } from './interest-description-form';
import { InterestMembership } from './interest-membership';

const T = createTranslate('pages.interests');

export function InterestItem(props: { interest: Interest; expanded: boolean; toggleExpanded: () => void }) {
  return (
    <li class="divide-y rounded-lg bg-neutral shadow-sm">
      <div class="col md:row">
        <img
          src={`/api/files/${props.interest.image}`}
          class={clsx(
            'aspect-video w-full rounded-t-lg object-cover md:w-64 md:rounded-tr-none',
            !props.expanded && 'md:rounded-bl-lg',
          )}
        />

        <div class="col flex-1 gap-4 p-6">
          <div class="col gap-2">
            <div class="row justify-between">
              <h2 class="text-xl font-medium">{props.interest.label}</h2>
              <h2 class="text-dim">
                <T id="membersCount" values={{ count: props.interest.members.length }} />
              </h2>
            </div>

            <div class="text-dim">{props.interest.description}</div>
          </div>

          <Button variant="ghost" onClick={() => props.toggleExpanded()} class="self-start">
            <T id={props.expanded ? 'collapse' : 'expand'} />
          </Button>
        </div>
      </div>

      <Show when={props.expanded}>
        <div class="col gap-4 p-8">
          <For each={props.interest.members} fallback={<CardFallback>{<T id="empty" />}</CardFallback>}>
            {(interestMember) => (
              <InterestItemMember interest={props.interest} interestMember={interestMember} />
            )}
          </For>
        </div>

        <InterestMembership interest={props.interest} />
      </Show>
    </li>
  );
}

function InterestItemMember(props: { interest: Interest; interestMember: InterestMember }) {
  const t = T.useTranslate();
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const [editing, setEditing] = createSignal(false);

  return (
    <div class="max-w-4xl">
      <div class="row items-center gap-2">
        <MemberAvatarName member={props.interestMember} />

        <Show when={isAuthenticatedMember(props.interestMember) && !editing()}>
          <Button
            variant="ghost"
            size="small"
            title={t('memberInterest.edit')}
            onClick={() => setEditing(true)}
          >
            <Icon path={pencil} class="size-4 text-dim" />
          </Button>
        </Show>
      </div>

      <Show when={!editing()}>
        <Show
          when={props.interestMember.description}
          fallback={
            <p class="py-1 pl-10 text-dim">
              <T id="memberInterest.description.empty" values={{ dash: <>&mdash;</> }} />
            </p>
          }
        >
          {(description) => <p class="py-1 pl-10 whitespace-pre-line">{description()}</p>}
        </Show>
      </Show>

      <Show when={editing()}>
        <InterestDescriptionForm
          interest={props.interest}
          interestMember={props.interestMember}
          onClose={() => setEditing(false)}
        />
      </Show>
    </div>
  );
}
