import { createForm } from '@felte/solid';
import { validateSchema } from '@nilscox/felte-validator-zod';
import { createPublicMessageBodySchema } from '@sel/shared';
import clsx from 'clsx';

import { Button } from '../../components/button';
import { RichEditor } from '../../components/rich-editor';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { TOKENS } from '../../tokens';
import { createErrorHandler } from '../../utils/create-error-handler';
import { createErrorMap } from '../../utils/zod-error-map';

const T = Translate.prefix('publicMessages.form');

export function PublicMessageForm(props: { onCancel: () => void; onSubmitted: () => void; class?: string }) {
  const t = T.useTranslation();
  const publicMessageApi = container.resolve(TOKENS.publicMessageApi);

  // @ts-expect-error solidjs directive
  const { form, setData } = createForm({
    initialValues: {
      body: '',
    },
    validate: validateSchema(createPublicMessageBodySchema, {
      errorMap: createErrorMap(),
    }),
    async onSubmit(values) {
      await publicMessageApi.createPublicMessage(values.body);
    },
    onSuccess: props.onSubmitted,
    onError: createErrorHandler(),
  });

  return (
    <form use:form class={clsx('col gap-2', props.class)}>
      <RichEditor placeholder={t('placeholder')} onChange={(html) => setData('body', html)} />
      <div class="row justify-end gap-4">
        <Button variant="secondary" onClick={() => props.onCancel()}>
          <Translate id="common.cancel" />
        </Button>
        <Button type="submit">
          <Translate id="common.publish" />
        </Button>
      </div>
    </form>
  );
}
