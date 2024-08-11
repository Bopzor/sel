import { createForm } from '@felte/solid';
import { validator } from '@nilscox/felte-validator-zod';
import { JSX } from 'solid-js';

import { Button } from '../../../components/button';
import { FormField } from '../../../components/form-field';
import { Input } from '../../../components/input';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { notify } from '../../../utils/notify';

const T = Translate.prefix('interests.createForm');

const schema = () => {
  const z = Translate.zod();

  return z.object({
    label: z.string().trim().min(3).max(50),
    description: z.string().trim().max(400),
  });
};

const strong = (children: JSX.Element[]) => <strong>{children}</strong>;

export function CreateInterestForm(props: {
  initialLabel: string;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const t = T.useTranslation();

  const interestsApi = container.resolve(TOKENS.interestApi);

  // @ts-expect-error solidjs directive
  const { form, errors } = createForm({
    extend: validator({ schema: schema() }),
    initialValues: {
      label: props.initialLabel,
      description: '',
    },
    async onSubmit({ label, description }) {
      const interestId = await interestsApi.createInterest(label, description);

      await interestsApi.joinInterest(interestId);

      notify.success(t('interestCreated', { strong, label }));
      props.onCreated();
    },
    onError: createErrorHandler(),
  });

  return (
    <div class="card p-8">
      <form use:form class="col mx-auto max-w-xl gap-4">
        <div class="text-xl font-medium">
          <T id="title" />
        </div>

        <FormField label={<T id="labelLabel" />} error={errors('label')}>
          <Input variant="outlined" name="label" />
        </FormField>

        <FormField label={<T id="descriptionLabel" />} error={errors('description')}>
          <Input variant="outlined" name="description" placeholder={t('descriptionPlaceholder')} />
        </FormField>

        <div class="row justify-end gap-4">
          <Button variant="secondary" type="reset" onClick={() => props.onCancel()}>
            <Translate id="common.cancel" />
          </Button>

          <Button type="submit">
            <Translate id="common.save" />
          </Button>
        </div>
      </form>
    </div>
  );
}
