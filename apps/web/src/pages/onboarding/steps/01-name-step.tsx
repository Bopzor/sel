import { createForm } from '@modular-forms/solid';
import { useMutation } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';
import { z } from 'zod';

import { api } from 'src/application/api';
import { getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { Input } from 'src/components/input';
import { createTranslate } from 'src/intl/translate';
import { zodForm } from 'src/utils/validation';

const T = createTranslate('pages.onboarding.steps.name');
const Translate = createTranslate('common');

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

type FormType = z.infer<typeof schema>;

export function NameStep(props: { next: () => void }) {
  const t = T.useTranslate();
  const member = getAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const [, { Form, Field }] = createForm<FormType>({
    initialValues: {
      firstName: member().firstName,
      lastName: member().lastName,
    },
    validate: zodForm(schema),
  });

  const mutation = useMutation(() => ({
    async mutationFn(data: FormType) {
      await api.updateMemberProfile({ path: { memberId: member().id }, body: data });
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
      props.next();
    },
  }));

  return (
    <>
      <p>
        <T id="sentence1" />
      </p>

      <Form class="col gap-4" onSubmit={(data) => mutation.mutateAsync(data)}>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field name="firstName">
            {(field, props) => (
              <Input
                {...props}
                variant="outlined"
                label={<T id="firstName.label" />}
                placeholder={t('firstName.placeholder')}
                value={field.value}
                error={field.error}
              />
            )}
          </Field>

          <Field name="lastName">
            {(field, props) => (
              <Input
                {...props}
                variant="outlined"
                label={<T id="lastName.label" />}
                placeholder={t('lastName.placeholder')}
                value={field.value}
                error={field.error}
              />
            )}
          </Field>
        </div>

        <Button
          type="submit"
          loading={mutation.isPending}
          end={<Icon path={arrowRight} class="size-6" />}
          class="self-end"
        >
          <Translate id="next" />
        </Button>
      </Form>
    </>
  );
}
