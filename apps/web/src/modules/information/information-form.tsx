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

export function InformationForm(props: { onCancel: () => void; onSubmitted: () => void; class?: string }) {
  const t = T.useTranslation();
  const queryClient = useQueryClient();
  const api = container.resolve(TOKENS.api);
  const authenticatedMember = getAuthenticatedMember();

  // @ts-expect-error solidjs directive
  const { form, setData, data, errors, isSubmitting } = createForm({
    initialValues: {
      body: '',
      isPin: false,
    },
    validate: validateSchema(createInformationBodySchema, {
      errorMap: createErrorMap(),
    }),
    async onSubmit(values) {
      await api.createInformation({ body: values });
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
        <MemberAvatarName genericLetsMember={data('isPin')} member={authenticatedMember()} />
      </div>

      <form use:form class={clsx('col gap-2', props.class)}>
        <FormField error={errors('body')}>
          <RichEditor placeholder={t('placeholder')} onChange={(html) => setData('body', html)} />
        </FormField>

        <div class="row items-center gap-4">
          <div class="me-auto">
            <label class="row items-center gap-2 font-medium text-dim">
              <input name="isPin" type="checkbox" />
              Actualité
            </label>
          </div>

          <Button variant="secondary" onClick={() => props.onCancel()}>
            <Translate id="common.cancel" />
          </Button>

          <Button type="submit" loading={isSubmitting()}>
            <Translate id="common.publish" />
          </Button>
        </div>
      </form>
    </div>
  );
}
