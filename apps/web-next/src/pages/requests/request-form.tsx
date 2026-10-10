import { Trans } from '@lingui/react/macro';
import { createRequestBodySchema, type Attachment, type CreateRequestBody } from '@sel/shared';
import { Button, Card } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { AttachmentsField, useAttachments } from 'src/components/attachments';
import { FormServerErrorAlert, InputField, RichTextField, submitWithMutation } from 'src/components/fields';
import { useFormApiError } from 'src/hooks/use-form-api-error';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

export function RequestForm<Result>({
  schema,
  defaultValues,
  attachments: initialAttachments,
  mutationFn,
  onSuccess,
  submitLabel,
  errorTitle,
}: {
  schema: typeof createRequestBodySchema;
  defaultValues?: Omit<CreateRequestBody, 'fileIds'>;
  attachments?: Attachment[];
  mutationFn: (body: CreateRequestBody) => Promise<Result>;
  onSuccess: (result: Result) => Promise<void>;
  submitLabel: React.ReactNode;
  errorTitle: React.ReactNode;
}) {
  const form = useForm({
    resolver: useZodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      body: defaultValues?.body ?? '',
      fileIds: initialAttachments?.map(({ fileId }) => fileId) ?? [],
    },
  });

  const mutation = useMutation({
    mutationFn,
    onSuccess,
    onError: useFormApiError(form),
  });

  const attachments = useAttachments({
    form,
    name: 'fileIds',
    initial: initialAttachments,
  });

  const onSubmit = (event: React.SubmitEvent) => {
    if (attachments.uploading) {
      event.preventDefault();
    } else {
      submitWithMutation(form, mutation)(event);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="stack gap-6">
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
        />

        <AttachmentsField
          label={<Trans>Attachments</Trans>}
          hint={<Trans>Photos or documents, up to 10 MB per file</Trans>}
          attachments={attachments}
        />

        <FormServerErrorAlert error={form.formState.errors.root} title={errorTitle} />
      </Card.Body>

      <Card.Footer className="justify-end">
        <Button
          type="submit"
          size="lg"
          loading={form.formState.isSubmitting || attachments.uploading}
          className="max-sm:w-full"
        >
          {submitLabel}
        </Button>
      </Card.Footer>
    </form>
  );
}
