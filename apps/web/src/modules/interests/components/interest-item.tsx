import { createForm } from '@felte/solid';
import { Interest } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';
import { For, createSignal } from 'solid-js';

import { Collapse } from '../../../components/collapse';
import { Link } from '../../../components/link';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { Switch } from '../../../components/switch';
import { useInvalidateApi } from '../../../infrastructure/api';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { getIsAuthenticatedMember, getRefetchAuthenticatedMember } from '../../../utils/authenticated-member';
import { notify } from '../../../utils/notify';

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
              <span class="py-6 text-center font-medium text-dim">
                <T id="noMembers" />
              </span>
            }
          >
            {(member) => (
              <li class="col sm:row items-start gap-x-4 gap-y-2">
                <Link
                  unstyled
                  class="row min-w-48 items-center gap-2 whitespace-nowrap"
                  href={routes.members.member(member.id)}
                >
                  <MemberAvatarName member={member} />
                </Link>

                <p class="mt-0.5 flex-1 italic">{member.description}</p>
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
};

function Header(props: HeaderProps) {
  return (
    <div class="col sm:row gap-2 py-6 sm:items-center">
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
          <div class="row flex-wrap items-center gap-x-2">
            <div class="text-xl font-semibold">{props.interest.label}</div>

            <div class="whitespace-nowrap text-sm text-dim">
              <T id="membersCount" values={{ count: props.interest.members.length }} />
            </div>
          </div>

          <p class="text-dim">{props.interest.description}</p>
        </div>
      </div>

      <JoinSwitch interest={props.interest} />
    </div>
  );
}

function JoinSwitch(props: { interest: Interest }) {
  const t = T.useTranslation();
  const api = container.resolve(TOKENS.api);
  const isAuthenticatedMember = getIsAuthenticatedMember();
  const refetchAuthenticatedMember = getRefetchAuthenticatedMember();
  const invalidate = useInvalidateApi();

  // @ts-expect-error solidjs directive
  const { form, handleSubmit } = createForm({
    initialValues: {
      joined: props.interest.members.some(isAuthenticatedMember),
    },
    async onSubmit({ joined }) {
      if (joined) {
        await api.joinInterest({ path: { interestId: props.interest.id }, body: {} });
      } else {
        await api.leaveInterest({ path: { interestId: props.interest.id } });
      }

      return joined;
    },
    async onSuccess(hasJoined) {
      await refetchAuthenticatedMember();
      await invalidate(['listInterests']);

      notify.success(
        t((hasJoined as boolean) ? 'joined' : 'left', {
          label: props.interest.label,
          strong: (children) => <strong>{children}</strong>,
        }),
      );
    },
  });

  return (
    <form use:form class="ml-auto">
      <Switch name="joined" onChange={() => setTimeout(() => handleSubmit(), 0)} />
    </form>
  );
}
