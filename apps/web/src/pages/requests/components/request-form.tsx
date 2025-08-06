import { createForm, setValue } from '@modular-forms/solid';
import { CreateRequestBody, createRequestBodySchema, Request } from '@sel/shared';
import { JSX } from 'solid-js';

import { AttachmentsEditorField } from 'src/components/attachments-editor';
import { Button } from 'src/components/button';
import { Input } from 'src/components/input';
import { RichEditor } from 'src/components/rich-editor';
import { createTranslate } from 'src/intl/translate';
import { createErrorMap, zodForm } from 'src/utils/validation';

const T = createTranslate('pages.requests.form');

export function RequestForm(props: {
  initialValue?: Request;
  onSubmit: (data: CreateRequestBody) => Promise<unknown>;
  submit: JSX.Element;
}) {
  const t = T.useTranslate();

  const [form, { Form, Field }] = createForm<CreateRequestBody>({
    initialValues: {
      title: props.initialValue?.title ?? '',
      body: props.initialValue?.message.body ?? '',
      fileIds: props.initialValue?.message.attachments.map(({ fileId }) => fileId),
    },
    validate: zodForm(createRequestBodySchema, {
      errorMap: createErrorMap(),
    }),
  });

  return (
    <Form class="my-6 col max-w-4xl gap-4" onSubmit={props.onSubmit}>
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

      <Field name="fileIds" type="string[]">
        {() => (
          <AttachmentsEditorField
            label={<T id="attachments.label" />}
            initialValue={props.initialValue?.message.attachments}
            onChange={(fileIds) => setValue(form, 'fileIds', fileIds)}
          />
        )}
      </Field>

      <Button type="submit" class="self-start" loading={form.submitting}>
        {props.submit}
      </Button>
    </Form>
  );
}
