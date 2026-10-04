import { Trans } from '@lingui/react/macro';
import { createRequestBodySchema, type CreateRequestBody } from '@sel/shared';
import { Button, Card, RichTextEditor } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { FormServerErrorAlert, InputField, RichTextField, submitWithMutation } from 'src/components/fields';
import { RichTextToolbar } from 'src/components/rich-text-toolbar';
import { useFormApiError } from 'src/hooks/use-form-api-error';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

export function RequestForm<Result>({
  schema,
  defaultValues,
  mutationFn,
  onSuccess,
  submitLabel,
  errorTitle,
}: {
  schema: typeof createRequestBodySchema;
  defaultValues?: CreateRequestBody;
  mutationFn: (body: CreateRequestBody) => Promise<Result>;
  onSuccess: (result: Result) => Promise<void>;
  submitLabel: React.ReactNode;
  errorTitle: React.ReactNode;
}) {
  const form = useForm({
    resolver: useZodResolver(schema),
    defaultValues: {
      title: '',
      body: '',
      fileIds: [],
      ...defaultValues,
    },
  });

  const mutation = useMutation({
    mutationFn,
    onSuccess,
    onError: useFormApiError(form),
  });

  return (
    <form noValidate onSubmit={submitWithMutation(form, mutation)} className="stack gap-6">
      <Card.Body className="stack gap-6">
        <InputField
          control={form.control}
          name="title"
          label={<Trans>Title</Trans>}
          hint={<Trans>A few words, for example: Help to put up a shelf</Trans>}
        />

        <RichTextField
          control={form.control}
          name="body"
          label={<Trans>Message</Trans>}
          hint={<Trans>What you need, when, and where</Trans>}
          toolbar={
            <RichTextEditor.Toolbar>
              <RichTextToolbar.Bold />
              <RichTextToolbar.Italic />
              <RichTextToolbar.Underline />
              <RichTextToolbar.Link />
              <RichTextToolbar.BulletList />
              <RichTextToolbar.OrderedList />
              <RichTextToolbar.Attachment />
            </RichTextEditor.Toolbar>
          }
        />

        <FormServerErrorAlert
          error={form.formState.errors.root}
          title={errorTitle}
        />
      </Card.Body>

      <Card.Footer className="justify-end">
        <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="max-sm:w-full">
          {submitLabel}
        </Button>
      </Card.Footer>
    </form>
  );
}
