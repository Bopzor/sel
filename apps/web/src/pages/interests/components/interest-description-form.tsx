import { createForm } from '@modular-forms/solid';
import { Interest, InterestMember, editInterestMemberBodySchema } from '@sel/shared';
import { useMutation } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { TextArea } from 'src/components/text-area';
import { createTranslate } from 'src/intl/translate';
import { createErrorMap, zodForm } from 'src/utils/validation';

const T = createTranslate('pages.interests.memberInterest');
const Translate = createTranslate('common');

export function InterestDescriptionForm(props: {
  interest: Interest;
  interestMember: InterestMember;
  onClose: () => void;
}) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const [form, { Form, Field }] = createForm<{ description: string }>({
    initialValues: {
      // eslint-disable-next-line solid/reactivity
      description: props.interestMember.description,
    },
    validate: zodForm(editInterestMemberBodySchema, {
      errorMap: createErrorMap(),
    }),
  });

  const mutation = useMutation(() => ({
    async mutationFn({ description }: { description: string }) {
      await api.editMemberInterestDescription({
        path: { interestId: props.interest.id },
        body: { description: description.trim() || undefined },
      });
    },
    async onSuccess() {
      await Promise.all([invalidate('getAuthenticatedMember'), invalidate('listInterests')]);
      props.onClose();
    },
  }));

  return (
    <Form class="col gap-2 py-1 pl-10" onSubmit={(data) => mutation.mutateAsync(data)}>
      <Field name="description">
        {(field, props) => (
          <TextArea
            {...props}
            variant="outlined"
            rows={4}
            placeholder={t('description.placeholder')}
            value={field.value}
            error={field.error}
            classes={{ field: 'h-auto' }}
          />
        )}
      </Field>

      <div class="row gap-2">
        <Button type="submit" variant="solid" loading={form.submitting}>
          <Translate id="save" />
        </Button>

        <Button variant="outline" onClick={() => props.onClose()}>
          <Translate id="cancel" />
        </Button>
      </div>
    </Form>
  );
}
