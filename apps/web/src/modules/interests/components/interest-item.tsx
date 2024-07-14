import { createForm } from '@felte/solid';
import { Interest } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';
import { For, createSignal } from 'solid-js';

import { getAppActions, isAuthenticatedMember } from '../../../app-context';
import { Collapse } from '../../../components/collapse';
import { Link } from '../../../components/link';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { Switch } from '../../../components/switch';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { notify } from '../../../utils/notify';

const T = Translate.prefix('interests');

export function InterestItem(props: { interest: Interest; refetch: () => void }) {
  const [expanded, setExpanded] = createSignal(false);

  return (
    <>
      <Header
        interest={props.interest}
        expanded={expanded()}
        toggleExpanded={() => setExpanded(!expanded())}
        refetch={props.refetch}
      />

      <Collapse open={expanded()}>
        <ul class="col gap-2 pb-6 ps-8">
          <For
            each={props.interest.members}
            fallback={
              <span class="py-6 text-center font-medium text-dim">
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

type HeaderProps = {
  interest: Interest;
  expanded: boolean;
  toggleExpanded: () => void;
  refetch: () => void;
};

function Header(props: HeaderProps) {
  return (
    <div class="col sm:row justify-between gap-2 py-6 sm:items-center">
      <div
        role="button"
        class="row flex-1 cursor-pointer items-center gap-4"
        onClick={() => props.toggleExpanded()}
      >
        <div>
          <Icon
            path={chevronRight}
            class="size-6 transition-transform"
            classList={{ 'rotate-90': props.expanded }}
          />
        </div>

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

      <JoinSwitch interest={props.interest} refetch={props.refetch} />
    </div>
  );
}

function JoinSwitch(props: { interest: Interest; refetch: () => void }) {
  const t = T.useTranslation();
  const interestApi = container.resolve(TOKENS.interestApi);
  const { refreshAuthenticatedMember } = getAppActions();

  // @ts-expect-error solidjs directive
  const { form, handleSubmit } = createForm({
    initialValues: {
      joined: props.interest.members.some(isAuthenticatedMember),
    },
    async onSubmit({ joined }) {
      if (joined) {
        await interestApi.joinInterest(props.interest.id);
      } else {
        await interestApi.leaveInterest(props.interest.id);
      }

      return joined;
    },
    onSuccess(hasJoined) {
      refreshAuthenticatedMember();
      props.refetch();

      notify.success(
        t((hasJoined as boolean) ? 'joined' : 'left', {
          label: props.interest.label,
          strong: (children) => <strong>{children}</strong>,
        }),
      );
    },
  });

  return (
    <form use:form>
      <Switch name="joined" onChange={() => setTimeout(() => handleSubmit(), 0)} />
    </form>
  );
}
