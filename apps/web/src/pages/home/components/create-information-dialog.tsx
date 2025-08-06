import { createForm, reset, setValue } from '@modular-forms/solid';
import { Attachment, CreateInformationBody, createInformationBodySchema } from '@sel/shared';
import { ReactiveMap } from '@solid-primitives/map';
import { useMutation } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { useInvalidateApi } from 'src/application/query';
import { AttachmentsEditorField } from 'src/components/attachments-editor';
import { Button } from 'src/components/button';
import { Dialog, DialogFooter, DialogHeader } from 'src/components/dialog';
import { Input } from 'src/components/input';
import { RichEditor } from 'src/components/rich-editor';
import { createTranslate } from 'src/intl/translate';
import { createErrorMap, zodForm } from 'src/utils/validation';

const T = createTranslate('pages.home.createInformation');
const Translate = createTranslate('common');

export function CreateInformationDialog(props: { open: boolean; onClose: () => void }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const [form, { Form, Field }] = createForm<CreateInformationBody>({
    initialValues: {
      title: '',
      body: '',
    },
    validate: zodForm(createInformationBodySchema, {
      errorMap: createErrorMap(),
    }),
  });

  const attachments = new ReactiveMap<string, Attachment>();

  const mutation = useMutation(() => ({
    async mutationFn(body: CreateInformationBody) {
      await api.createInformation({ body });
    },
    async onSuccess() {
      await invalidate('listInformation');
      notify.success(t('created'));
      props.onClose();
    },
  }));

  const onSubmit = (data: { title: string; body: string }) => {
    return mutation.mutateAsync({
      ...data,
      fileIds: Array.from(attachments.keys()),
    });
  };

  return (
    <Dialog open={props.open} onClose={() => props.onClose()} onClosed={() => reset(form)} class="max-w-3xl">
      <DialogHeader title={<T id="dialogTitle" />} onClose={() => props.onClose()} />

      <Form onSubmit={onSubmit} class="col gap-4">
        <Field name="title">
          {(field) => (
            <Input
              variant="outlined"
              label={<T id="title.label" />}
              value={field.value}
              placeholder={t('title.placeholder')}
              error={field.error}
              onInput={(event) => setValue(form, 'title', event.target.value)}
            />
          )}
        </Field>

        <Field name="body">
          {(field) => (
            <RichEditor
              variant="outlined"
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
              onChange={(fileIds) => setValue(form, 'fileIds', fileIds)}
            />
          )}
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={() => props.onClose()}>
            <Translate id="cancel" />
          </Button>
          <Button type="submit" loading={form.submitting}>
            <T id="create" />
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
}
