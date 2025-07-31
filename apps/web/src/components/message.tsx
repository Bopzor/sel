import { Attachement, isImage, type Message } from '@sel/shared';
import { not } from '@sel/utils';
import clsx from 'clsx';
import { For, mergeProps, Show } from 'solid-js';

import { createTranslate } from 'src/intl/translate';

const T = createTranslate('components.message');

export function Message(props1: { attachementsSeparator?: boolean; message?: Message; class?: string }) {
  const props = mergeProps({ attachementsSeparator: true }, props1);

  return (
    <div class={props.class}>
      <RichText content={props.message?.body} />

      <Show when={props.message?.attachements.length}>
        <div class="my-4 row items-center gap-2">
          <div class="text-sm leading-none font-medium text-dim">
            <T id="attachements" />
          </div>
          <hr class="flex-1" classList={{ hidden: !props.attachementsSeparator }} />
        </div>

        <Attachements attachements={props.message?.attachements} />
      </Show>
    </div>
  );
}

export function RichText(props: { class?: string; content?: string }) {
  // eslint-disable-next-line solid/no-innerhtml
  return <div class={clsx('prose max-w-none dark:prose-invert', props.class)} innerHTML={props.content} />;
}

function Attachements(props: { attachements?: Attachement[] }) {
  const images = () => props.attachements?.filter(isImage);
  const notImages = () => props.attachements?.filter(not(isImage));

  return (
    <div class="col items-start gap-4">
      <div class="row flex-wrap gap-4" classList={{ hidden: !images()?.length }}>
        <For each={images()}>{(attachement) => <ImagePreview name={attachement.name} />}</For>
      </div>

      <For each={notImages()}>
        {(attachement) => <FilePreview name={attachement.name} originalName={attachement.originalName} />}
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
