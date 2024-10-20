import { createForm } from '@felte/solid';
import { validateSchema } from '@nilscox/felte-validator-zod';
import { createInformationBodySchema } from '@sel/shared';
import { useQueryClient } from '@tanstack/solid-query';
import clsx from 'clsx';

import { Button } from '../../components/button';
import { FormField } from '../../components/form-field';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { RichEditor } from '../../components/rich-editor';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { TOKENS } from '../../tokens';
import { getAuthenticatedMember } from '../../utils/authenticated-member';
import { createErrorHandler } from '../../utils/create-error-handler';
import { createErrorMap } from '../../utils/zod-error-map';

const T = Translate.prefix('information.form');

type InformationFormProps = {
  isPin: boolean;
  onSubmitted: () => void;
  class?: string;
};

export function InformationForm(props: InformationFormProps) {
  const t = T.useTranslation();
  const queryClient = useQueryClient();
  const api = container.resolve(TOKENS.api);
  const authenticatedMember = getAuthenticatedMember();

  // @ts-expect-error solidjs directive
  const { form, setData, errors, isSubmitting } = createForm({
    initialValues: {
      body: '',
    },
    validate: validateSchema(createInformationBodySchema, {
      errorMap: createErrorMap(),
    }),
    async onSubmit(values) {
      await api.createInformation({ body: { ...values, isPin: props.isPin } });
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['listInformation'] });
      props.onSubmitted();
    },
    onError: createErrorHandler(),
  });

  return (
    <div class="col gap-3">
      <div class="row items-center gap-2">
        <MemberAvatarName genericLetsMember={props.isPin} member={authenticatedMember()} />
      </div>

      <form use:form class={clsx('col gap-2', props.class)}>
        <FormField error={errors('body')}>
          <RichEditor placeholder={t('placeholder')} onChange={(html) => setData('body', html)} />
        </FormField>

        <Button type="submit" loading={isSubmitting()} class="ms-auto">
          <Translate id="common.publish" />
        </Button>
      </form>
    </div>
  );
}
