import { Trans, useLingui } from '@lingui/react/macro';
import { isImage, type Attachment } from '@sel/shared';
import { Button, Fieldset, Icon, IconButton, showToast, Spinner } from '@sel/ui';
import { Mutation, useMutation, useMutationState } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { useController, type FieldPathByValue, type FieldValues, type UseFormReturn } from 'react-hook-form';

import { fileUrl, maxFileSize, uploadFile } from 'src/app/api';
import { useFileInput } from 'src/hooks/use-file-input';

const noFileIds: string[] = [];

type UseAttachmentsOptions<Values extends FieldValues, Transformed> = {
  form: UseFormReturn<Values, unknown, Transformed>;
  name: FieldPathByValue<Values, string[] | undefined>;
  initial?: Attachment[];
};

export function useAttachments<Values extends FieldValues, Transformed>({
  form,
  name,
  initial = [],
}: UseAttachmentsOptions<Values, Transformed>) {
  const { t } = useLingui();
  const { field } = useController({ control: form.control, name });
  const fileIds = (field.value as string[] | undefined) ?? noFileIds;

  const [uploaded, setUploaded] = useState(initial);

  // Uploads can end one after the other before the next render: read the form's current value, not field.value.
  const getFileIds = () => (form.getValues(name) as string[] | undefined) ?? noFileIds;

  const mutationKey = ['upload', useId()];

  const upload = useMutation({
    mutationKey,
    mutationFn: uploadFile,
    // Not the callbacks of mutate, which only run for the last of the concurrent uploads.
    onSuccess: ({ id, ...file }) => {
      setUploaded((prev) => [...prev, { fileId: id, ...file }]);
      field.onChange([...getFileIds(), id]);
    },
    onError: (_error, { name }) => {
      showToast(t`${name} could not be attached. Try again in a few moments.`, 'error');
    },
  });

  const pending = useMutationState({
    filters: { mutationKey, status: 'pending' },
    select: ({ mutationId, state }: Mutation<unknown, Error, File>) => ({
      key: mutationId,
      originalName: state.variables?.name ?? '',
    }),
  });

  const add = (files: File[]) => {
    for (const file of files) {
      const { name } = file;

      if (file.size > maxFileSize) {
        showToast(t`${name} is larger than 10 MB and was not attached`, 'error');
      } else {
        upload.mutate(file);
      }
    }
  };

  const attachments = fileIds.flatMap(
    (fileId) => uploaded.find((attachment) => attachment.fileId === fileId) ?? [],
  );

  return {
    attachments,
    pending,
    uploading: pending.length > 0,
    add,
    remove: (fileId: string) => field.onChange(getFileIds().filter((id) => id !== fileId)),
  };
}

type Attachments = ReturnType<typeof useAttachments>;

type AttachmentsFieldProps = {
  label: React.ReactNode;
  hint?: React.ReactNode;
  attachments: Attachments;
};

export function AttachmentsField({ label, hint, attachments }: AttachmentsFieldProps) {
  const fileInput = useFileInput(attachments.add);

  return (
    <Fieldset.Root>
      <Fieldset.Header>
        <Fieldset.Legend>{label}</Fieldset.Legend>
        {hint && <Fieldset.Hint>{hint}</Fieldset.Hint>}
      </Fieldset.Header>

      <AttachmentsList {...attachments} />

      <Button variant="secondary" icon="add" onClick={fileInput.open} className="self-start">
        <Trans>Add files</Trans>
      </Button>

      {fileInput.input}
    </Fieldset.Root>
  );
}

type AttachmentsListProps = Pick<Attachments, 'attachments' | 'pending' | 'remove'>;

export function AttachmentsList({ attachments, pending, remove }: AttachmentsListProps) {
  if (attachments.length === 0 && pending.length === 0) {
    return null;
  }

  return (
    <ul className="stack gap-2">
      {attachments.map((attachment) => (
        <AttachmentsListItem
          key={attachment.fileId}
          name={attachment.originalName}
          preview={<Preview attachment={attachment} />}
          onRemove={() => remove(attachment.fileId)}
        />
      ))}

      {pending.map((upload) => (
        <AttachmentsListItem
          key={upload.key}
          name={upload.originalName}
          preview={<Spinner className="text-muted" />}
          busy
        />
      ))}
    </ul>
  );
}

type AttachmentsListItemProps = {
  name: string;
  preview: React.ReactNode;
  busy?: boolean;
  onRemove?: () => void;
};

function AttachmentsListItem({ name, preview, busy, onRemove }: AttachmentsListItemProps) {
  const { t } = useLingui();

  return (
    <li aria-busy={busy} className="row max-w-96 items-center gap-3">
      <div className="row size-10 shrink-0 items-center justify-center">{preview}</div>
      <span className="grow truncate text-body-sm">{name}</span>
      {onRemove && <IconButton icon="close" size="sm" label={t`Remove ${name}`} onClick={onRemove} />}
    </li>
  );
}

function Preview({ attachment }: { attachment: Attachment }) {
  if (isImage(attachment)) {
    return <img src={fileUrl(attachment.name)} alt="" className="size-10 rounded-sm border object-cover" />;
  }

  return <Icon name="attachment" className="text-muted" />;
}
