import { createForm } from '@felte/solid';
import type { Interest, MemberInterest } from '@sel/shared';
import { For, Show, createSignal } from 'solid-js';

import { authenticatedMember, getAppActions } from '../../../app-context';
import { Button } from '../../../components/button';
import { Link } from '../../../components/link';
import { TextArea } from '../../../components/text-area';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { notify } from '../../../utils/notify';

const T = Translate.prefix('profile.interests');

export default function ProfileInterestsPage() {
  return (
    <>
      <h1>
        <T id="title" />
      </h1>

      <ul class="col gap-8">
        <For each={authenticatedMember()?.interests} fallback={<NoInterests />}>
          {(interest) => <Interest interest={interest} />}
        </For>
      </ul>
    </>
  );
}

function NoInterests() {
  return (
    <div class="col min-h-32 justify-center gap-3 px-4 text-center">
      <p class="font-medium text-dim">
        <T id="noInterests.line1" />
      </p>
      <p class="text-sm text-dim">
        <T
          id="noInterests.line2"
          values={{ link: (children) => <Link href={routes.interests}>{children}</Link> }}
        />
      </p>
    </div>
  );
}

function Interest(props: { interest: MemberInterest }) {
  const t = T.useTranslation();
  const [editing, setEditing] = createSignal(false);

  const interestApi = container.resolve(TOKENS.interestApi);
  const { refreshAuthenticatedMember } = getAppActions();

  // @ts-expect-error solidjs directive
  const { form, isSubmitting } = createForm({
    initialValues: {
      description: props.interest.description,
    },
    async onSubmit({ description }) {
      await interestApi.editMemberInterestDescription(props.interest.interestId, description || undefined);
    },
    onSuccess() {
      notify.success(t('edited'));
      refreshAuthenticatedMember();
      setEditing(false);
    },
    onError: createErrorHandler(),
  });

  return (
    <li class="col items-start gap-1">
      <div class="text-lg font-medium">{props.interest.label}</div>

      <Show when={editing()}>
        <form use:form class="col gap-2 self-stretch">
          <TextArea name="description" ref={(ref) => setTimeout(() => ref.focus(), 0)} />

          <Button type="submit" loading={isSubmitting()} class="self-start">
            <Translate id="common.save" />
          </Button>
        </form>
      </Show>

      <Show when={!editing()}>
        <Show
          when={props.interest.description !== undefined}
          fallback={
            <>
              <em class="text-dim">
                <T id="noDescription" />
              </em>

              <Button variant="secondary" class="mt-2" onClick={() => setEditing(true)}>
                <T id="addDescription" />
              </Button>
            </>
          }
        >
          <div class="border-l-4 pl-2">
            <p>{props.interest.description}</p>
          </div>

          <Button variant="secondary" class="mt-2" onClick={() => setEditing(true)}>
            <T id="updateDescription" />
          </Button>
        </Show>
      </Show>
    </li>
  );
}
