import { Attachment, isImage, type Message } from '@sel/shared';
import { not } from '@sel/utils';
import clsx from 'clsx';
import { For, mergeProps, Show } from 'solid-js';

import { createTranslate } from 'src/intl/translate';

const T = createTranslate('components.message');

export function Message(props1: { attachmentsSeparator?: boolean; message?: Message; class?: string }) {
  const props = mergeProps({ attachmentsSeparator: true }, props1);

  return (
    <div class={props.class}>
      <RichText content={props.message?.body} />

      <Show when={props.message?.attachments.length}>
        <div class="my-4 row items-center gap-2">
          <div class="text-sm leading-none font-medium text-dim">
            <T id="attachments" />
          </div>
          <hr class="flex-1" classList={{ hidden: !props.attachmentsSeparator }} />
        </div>

        <Attachments attachments={props.message?.attachments} />
      </Show>
    </div>
  );
}

export function RichText(props: { class?: string; content?: string }) {
  // eslint-disable-next-line solid/no-innerhtml
  return <div class={clsx('prose max-w-none dark:prose-invert', props.class)} innerHTML={props.content} />;
}

function Attachments(props: { attachments?: Attachment[] }) {
  const images = () => props.attachments?.filter(isImage);
  const notImages = () => props.attachments?.filter(not(isImage));

  return (
    <div class="col items-start gap-4">
      <div class="row flex-wrap gap-4" classList={{ hidden: !images()?.length }}>
        <For each={images()}>{(attachment) => <ImagePreview name={attachment.name} />}</For>
      </div>

      <For each={notImages()}>
        {(attachment) => <FilePreview name={attachment.name} originalName={attachment.originalName} />}
      </For>
    </div>
  );
}

export function ImagePreview(props: { name: string }) {
  const src = () => `/api/files/${props.name}`;

  return (
    <a href={src()} target="_blank">
      <img src={src()} class="h-16 rounded-md shadow" />
    </a>
  );
}

export function FilePreview(props: { name: string; originalName: string }) {
  const src = () => `/api/files/${props.name}`;

  return (
    <a href={src()} target="_blank" class="text-sm leading-none font-medium text-primary underline">
      {props.originalName}
    </a>
  );
}
