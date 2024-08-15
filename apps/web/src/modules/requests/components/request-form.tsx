import { createForm } from '@felte/solid';
import { validateSchema } from '@nilscox/felte-validator-zod';
import { createRequestBodySchema, Request } from '@sel/shared';
import { JSX } from 'solid-js';

import { Button } from '../../../components/button';
import { FormField } from '../../../components/form-field';
import { Input } from '../../../components/input';
import { RichEditor } from '../../../components/rich-editor';
import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { createErrorMap } from '../../../utils/zod-error-map';

const T = Translate.prefix('requests.form');

type RequestFormProps = {
  request?: Request;
  submit: JSX.Element;
  onSubmit: (title: string, body: string) => Promise<unknown>;
  onSubmitted: (result: unknown) => void;
};

export function RequestForm(props: RequestFormProps) {
  const t = T.useTranslation();

  // @ts-expect-error solidjs directive
  const { form, setData, isSubmitting, errors } = createForm({
    initialValues: {
      title: props.request?.title ?? '',
      body: props.request?.body ?? '',
    },
    validate: validateSchema(createRequestBodySchema, {
      errorMap: createErrorMap(),
    }),
    async onSubmit(values) {
      return props.onSubmit(values.title, values.body);
    },
    onSuccess(result) {
      props.onSubmitted(result);
    },
    onError: createErrorHandler(),
  });

  return (
    <form use:form class="col my-6 max-w-4xl gap-4">
      <FormField label={<T id="titleLabel" />} error={errors('title')}>
        <Input name="title" placeholder={t('titlePlaceholder')} />
      </FormField>

      <FormField label={<T id="bodyLabel" />} error={errors('body')}>
        <RichEditor
          placeholder={t('bodyPlaceholder')}
          initialValue={props.request?.body}
          onChange={(html) => setData('body', html)}
        />
      </FormField>

      <Button type="submit" class="self-start" loading={isSubmitting()}>
        {props.submit}
      </Button>
    </form>
  );
}
