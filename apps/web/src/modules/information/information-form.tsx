import { createForm } from '@felte/solid';
import { validateSchema } from '@nilscox/felte-validator-zod';
import { createInformationBodySchema } from '@sel/shared';
import clsx from 'clsx';

import { authenticatedMember } from '../../app-context';
import { Button } from '../../components/button';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { RichEditor } from '../../components/rich-editor';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { TOKENS } from '../../tokens';
import { createErrorHandler } from '../../utils/create-error-handler';
import { createErrorMap } from '../../utils/zod-error-map';

const T = Translate.prefix('information.form');

export function InformationForm(props: { onCancel: () => void; onSubmitted: () => void; class?: string }) {
  const t = T.useTranslation();
  const informationApi = container.resolve(TOKENS.informationApi);

  // @ts-expect-error solidjs directive
  const { form, setData, data } = createForm({
    initialValues: {
      body: '',
      isPin: false,
    },
    validate: validateSchema(createInformationBodySchema, {
      errorMap: createErrorMap(),
    }),
    async onSubmit(values) {
      await informationApi.createInformation(values.body, values.isPin);
    },
    onSuccess: props.onSubmitted,
    onError: createErrorHandler(),
  });

  return (
    <div class="col gap-3">
      <div class="row items-center gap-2">
        <MemberAvatarName genericLetsMember={data('isPin')} member={authenticatedMember()} />
      </div>

      <form use:form class={clsx('col gap-2', props.class)}>
        <RichEditor placeholder={t('placeholder')} onChange={(html) => setData('body', html)} />

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

          <Button type="submit">
            <Translate id="common.publish" />
          </Button>
        </div>
      </form>
    </div>
  );
}
