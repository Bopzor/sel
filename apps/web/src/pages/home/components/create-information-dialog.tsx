import { createForm, setValue } from '@modular-forms/solid';
import { createInformationBodySchema } from '@sel/shared';
import { useMutation } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { Dialog, DialogFooter, DialogHeader } from 'src/components/dialog';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { RichEditor } from 'src/components/rich-editor';
import { createTranslate } from 'src/intl/translate';
import { createErrorMap, zodForm } from 'src/utils/validation';

const T = createTranslate('pages.home.publish.createInformation');
const Translate = createTranslate('common');

export function CreateInformationDialog(props: { open: boolean; onClose: () => void }) {
  const t = T.useTranslate();
  const member = getAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const [form, { Form, Field }] = createForm<{ body: string }>({
    initialValues: {
      body: '',
    },
    validate: zodForm(createInformationBodySchema, {
      errorMap: createErrorMap(),
    }),
  });

  const mutation = useMutation(() => ({
    async mutationFn(body: { body: string }) {
      await api.createInformation({ body });
    },
    async onSuccess() {
      await invalidate('listInformation');
      notify.success(t('created'));
      props.onClose();
    },
  }));

  return (
    <Dialog open={props.open} onClose={() => props.onClose()} class="max-w-3xl">
      <DialogHeader title={<T id="title" />} onClose={() => props.onClose()} />

      <Form onSubmit={(data) => mutation.mutateAsync(data)}>
        <Field name="body">
          {(field) => (
            <RichEditor
              variant="outlined"
              label={<MemberAvatarName member={member()} classes={{ root: 'mb-1' }} />}
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
