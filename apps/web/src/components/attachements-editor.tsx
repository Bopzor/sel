import { Attachement, isImage } from '@sel/shared';
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

const T = createTranslate('components.attachementsEditor');

export function AttachementsEditorField(props: {
  label?: JSX.Element;
  initialValue?: Attachement[];
  onChange: (fileIds: string[]) => void;
}) {
  const attachements = new ReactiveMap<string, Attachement>(
    props.initialValue?.map((attachement) => [attachement.fileId, attachement]),
  );

  const onAdd = (attachement: Attachement) => {
    attachements.set(attachement.fileId, attachement);
    props.onChange(Array.from(attachements.keys()));
  };

  const onRemove = (attachement: Attachement) => {
    attachements.delete(attachement.fileId);
    props.onChange(Array.from(attachements.keys()));
  };

  return (
    <AttachementEditor
      label={props.label}
      value={Array.from(attachements.values())}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );
}

export function AttachementEditor(props: {
  id?: string;
  label?: JSX.Element;
  value: Attachement[];
  onAdd?: (attachement: Attachement) => void;
  onRemove: (attachement: Attachement) => void;
}) {
  const id = createId(() => props.id);

  return (
    <FormControl id={id()} label={props.label}>
      <AttachementEditorList
        value={props.value}
        onAdd={props.onAdd}
        onRemove={props.onRemove}
        class="col gap-4 rounded-lg bg-neutral px-4 py-3 shadow"
      />
    </FormControl>
  );
}

export function AttachementEditorList(props: {
  value: Attachement[];
  onAdd?: (attachement: Attachement) => void;
  onRemove: (attachement: Attachement) => void;
  class?: string;
}) {
  const t = T.useTranslate();

  const upload = createFileUploadHandler(({ id, name, originalName, mimetype }) => {
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
            class="flex size-16 items-center justify-center rounded-md border transition-shadow hover:shadow-md"
          >
            <Icon path={plus} class="size-8" />
            <input type="file" onChange={upload} class="sr-only" />
          </label>
        </Show>

        <For each={images()}>
          {(attachement) => (
            <div class="relative">
              <RemoveButton onClick={() => props.onRemove(attachement)} />
              <ImagePreview name={attachement.name} />
            </div>
          )}
        </For>
      </div>

      <Show when={notImages().length > 0}>
        <div class="row flex-wrap gap-4">
          <For each={notImages()}>
            {(attachement) => (
              <div class="relative rounded-md border-2 px-4 py-1 shadow">
                <RemoveButton onClick={() => props.onRemove(attachement)} />
                <FilePreview name={attachement.name} originalName={attachement.originalName} />
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
