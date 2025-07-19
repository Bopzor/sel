import { createForm, reset, setValue } from '@modular-forms/solid';
import { createInformationBodySchema } from '@sel/shared';
import { useMutation } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { Dialog, DialogFooter, DialogHeader } from 'src/components/dialog';
import { Input } from 'src/components/input';
import { RichEditor } from 'src/components/rich-editor';
import { createTranslate } from 'src/intl/translate';
import { createErrorMap, zodForm } from 'src/utils/validation';

const T = createTranslate('pages.home.publish.createInformation');
const Translate = createTranslate('common');

export function CreateInformationDialog(props: { open: boolean; onClose: () => void }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const [form, { Form, Field }] = createForm<{ title: string; body: string }>({
    initialValues: {
      title: '',
      body: '',
    },
    validate: zodForm(createInformationBodySchema, {
      errorMap: createErrorMap(),
    }),
  });

  const mutation = useMutation(() => ({
    async mutationFn(body: { title: string; body: string }) {
      await api.createInformation({ body });
    },
    async onSuccess() {
      await invalidate('listInformation');
      notify.success(t('created'));
      props.onClose();
    },
  }));

  return (
    <Dialog open={props.open} onClose={() => props.onClose()} onClosed={() => reset(form)} class="max-w-3xl">
      <DialogHeader title={<T id="dialogTitle" />} onClose={() => props.onClose()} />

      <Form onSubmit={(data) => mutation.mutateAsync(data)} class="col gap-4">
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
