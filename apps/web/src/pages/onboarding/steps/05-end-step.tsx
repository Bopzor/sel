import { createForm } from '@modular-forms/solid';
import { useMutation } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { getAppConfig } from 'src/application/config';
import { getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { externalLink } from 'src/components/link';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.onboarding.steps.end');

export function EndStep() {
  const { contactLink } = getAppConfig();
  const member = getAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const [, { Form }] = createForm();

  const mutation = useMutation(() => ({
    async mutationFn() {
      await api.updateMemberProfile({ path: { memberId: member().id }, body: { onboardingCompleted: true } });
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
    },
  }));

  return (
    <>
      <h1>
        <T id="title" />
      </h1>

      <div class="col gap-4">
        <p>
          <T id="sentence1" />
        </p>
        <p>
          <T id="sentence2" values={{ link: externalLink(contactLink, { class: 'text-link' }) }} />
        </p>
      </div>

      <Form class="col" onSubmit={() => mutation.mutateAsync()}>
        <Button type="submit" loading={mutation.isPending} class="self-center">
          <T id="end" />
        </Button>
      </Form>
    </>
  );
}
