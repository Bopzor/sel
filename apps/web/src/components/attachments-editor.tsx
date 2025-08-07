import { Attachment, isImage } from '@sel/shared';
import { not } from '@sel/utils';
import { ReactiveMap } from '@solid-primitives/map';
import { Icon } from 'solid-heroicons';
import { plus, xMark } from 'solid-heroicons/solid';
import { For, JSX, Show } from 'solid-js';

import { createTranslate } from 'src/intl/translate';
import { createFileUploadHandler } from 'src/utils/file-upload';
import { createId } from 'src/utils/id';

import { FormControl } from './form-control';
import { FilePreview, ImagePreview } from './message';
import { Spinner } from './spinner';

const T = createTranslate('components.attachmentsEditor');

export function AttachmentsEditorField(props: {
  label?: JSX.Element;
  initialValue?: Attachment[];
  onChange: (fileIds: string[]) => void;
}) {
  const attachments = new ReactiveMap<string, Attachment>(
    props.initialValue?.map((attachment) => [attachment.fileId, attachment]),
  );

  const onAdd = (attachment: Attachment) => {
    attachments.set(attachment.fileId, attachment);
    props.onChange(Array.from(attachments.keys()));
  };

  const onRemove = (attachment: Attachment) => {
    attachments.delete(attachment.fileId);
    props.onChange(Array.from(attachments.keys()));
  };

  return (
    <AttachmentEditor
      label={props.label}
      value={Array.from(attachments.values())}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );
}

export function AttachmentEditor(props: {
  id?: string;
  label?: JSX.Element;
  value: Attachment[];
  onAdd?: (attachment: Attachment) => void;
  onRemove: (attachment: Attachment) => void;
}) {
  const id = createId(() => props.id);

  return (
    <FormControl id={id()} label={props.label}>
      <AttachmentEditorList
        value={props.value}
        onAdd={props.onAdd}
        onRemove={props.onRemove}
        class="col gap-4 rounded-lg bg-neutral px-4 py-3 shadow"
      />
    </FormControl>
  );
}

export function AttachmentEditorList(props: {
  value: Attachment[];
  onAdd?: (attachment: Attachment) => void;
  onRemove: (attachment: Attachment) => void;
  loading?: boolean;
  class?: string;
}) {
  const t = T.useTranslate();

  const [upload, isPending] = createFileUploadHandler(({ id, name, originalName, mimetype }) => {
    props.onAdd?.({ fileId: id, name, originalName, mimetype });
  });

  const images = () => props.value.filter(isImage);
  const notImages = () => props.value.filter(not(isImage));

  return (
    <div class={props.class}>
      <div class="row flex-wrap gap-4">
        <Show when={props.onAdd !== undefined}>
          <label
            role="button"
            title={t('add')}
            class="flex size-16 items-center justify-center rounded-md border transition-shadow hover:shadow-md aria-disabled:cursor-default"
            aria-disabled={isPending()}
          >
            <Show when={!isPending()} fallback={<Spinner class="size-8" />}>
              <Icon path={plus} class="size-8" />
            </Show>
            <input type="file" disabled={isPending()} onChange={upload} class="sr-only" />
          </label>
        </Show>

        <For each={images()}>
          {(attachment) => (
            <div class="relative">
              <RemoveButton onClick={() => props.onRemove(attachment)} />
              <ImagePreview name={attachment.name} />
            </div>
          )}
        </For>
      </div>

      <Show when={notImages().length > 0}>
        <div class="row flex-wrap gap-4">
          <For each={notImages()}>
            {(attachment) => (
              <div class="relative rounded-md border-2 px-4 py-1 shadow">
                <RemoveButton onClick={() => props.onRemove(attachment)} />
                <FilePreview name={attachment.name} originalName={attachment.originalName} />
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

function RemoveButton(props: { onClick: () => void }) {
  return (
    <button
      class="absolute -top-2 -right-2 rounded-full border-2 bg-neutral shadow transition-transform hover:scale-110"
      onClick={() => props.onClick()}
    >
      <Icon path={xMark} class="size-4 stroke-2" />
    </button>
  );
}
