import { createForm, setValue } from '@modular-forms/solid';
import { createRequestBodySchema } from '@sel/shared';
import { JSX } from 'solid-js';

import { Button } from 'src/components/button';
import { Input } from 'src/components/input';
import { RichEditor } from 'src/components/rich-editor';
import { createTranslate } from 'src/intl/translate';
import { createErrorMap, zodForm } from 'src/utils/validation';

const T = createTranslate('pages.requests.form');

type FormType = {
  title: string;
  body: string;
};

export function RequestForm(props: {
  initialValues?: FormType;
  onSubmit: (data: FormType) => Promise<unknown>;
  submit: JSX.Element;
}) {
  const t = T.useTranslate();

  const [form, { Form, Field }] = createForm<FormType>({
    initialValues: {
      title: props.initialValues?.title ?? '',
      body: props.initialValues?.body ?? '',
    },
    validate: zodForm(createRequestBodySchema, {
      errorMap: createErrorMap(),
    }),
  });

  return (
    <Form class="my-6 col max-w-4xl gap-4" onSubmit={(data) => props.onSubmit(data)}>
      <Field name="title">
        {(field, props) => (
          <Input
            label={<T id="title.label" />}
            placeholder={t('title.placeholder')}
            error={field.error}
            value={field.value}
            {...props}
          />
        )}
      </Field>

      <Field name="body">
        {(field) => (
          <RichEditor
            label={<T id="body.label" />}
            initialValue={field.value}
            placeholder={t('body.placeholder')}
            error={field.error}
            onChange={(html) => setValue(form, 'body', html)}
          />
        )}
      </Field>

      <Button type="submit" class="self-start" loading={form.submitting}>
        {props.submit}
      </Button>
    </Form>
  );
}
