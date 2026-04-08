import { omitUndefined, pick } from '@sel/utils';
import { Editor as TiptapEditor } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import { default as IconBold } from 'heroicons/24/solid/bold.svg';
import { default as IconItalic } from 'heroicons/24/solid/italic.svg';
import { default as IconLink } from 'heroicons/24/solid/link.svg';
import { default as IconListBullet } from 'heroicons/24/solid/list-bullet.svg';
import { default as IconNumberedList } from 'heroicons/24/solid/numbered-list.svg';
import { default as IconPaperClip } from 'heroicons/24/solid/paper-clip.svg';
import { default as IconUnderline } from 'heroicons/24/solid/underline.svg';
import { ComponentProps, JSX, Show, splitProps, untrack, ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { createEditorTransaction, createTiptapEditor } from 'solid-tiptap';

import { createTranslate } from 'src/intl/translate';

import { Field, FieldVariant } from './form-controls';
import { Spinner } from './spinner';

const T = createTranslate('components.richEditor');

type CreateRichEditorProps = {
  element: HTMLElement;
  placeholder?: string;
  initialValue?: string;
  editorAttributes?: object;
  onChange?: (html: string) => void;
};

export function createRichEditor(props: () => CreateRichEditorProps) {
  return createTiptapEditor(() => {
    const { element, placeholder, initialValue, editorAttributes, onChange } = props();

    return {
      element,
      extensions: [StarterKit, Underline, Link, Placeholder.configure({ placeholder }), Image],
      content: initialValue,
      editorProps: {
        attributes: {
          ...editorAttributes,
          class: 'outline-none grow prose max-w-none dark:prose-invert',
        },
      },
      onUpdate({ editor }) {
        onChange?.(editor.getHTML());
      },
    };
  });
}

export function RichEditor(_props: {
  variant?: FieldVariant;
  label?: JSX.Element;
  error?: JSX.Element;
  placeholder?: string;
  initialValue?: string;
  onChange?: (html: string) => void;
}) {
  const [fieldProps, props] = splitProps(_props, ['label', 'error']);

  return (
    <Field {...fieldProps}>
      <Field.Context>
        {(field) => <Editor {...props} variant={props.variant} inputProps={field().getInputProps()} />}
      </Field.Context>
    </Field>
  );
}

export function Editor(props: {
  variant?: FieldVariant;
  placeholder?: string;
  initialValue?: string;
  onChange?: (html: string) => void;
  inputProps: ComponentProps<'input'>;
}) {
  let ref!: HTMLDivElement;

  const editor = createRichEditor(() => ({
    element: ref,
    placeholder: props.placeholder,
    initialValue: untrack(() => props.initialValue),
    onChange: props.onChange,
    editorAttributes: omitUndefined(
      pick(props.inputProps, ['id', 'name', 'aria-invalid', 'aria-labelledby', 'aria-describedby']),
    ),
  }));

  return (
    <div
      data-scope="field"
      data-part="input-shell"
      data-variant={props.variant ?? 'solid'}
      class="col! h-64 resize-y items-stretch overflow-auto"
    >
      <div ref={ref} class="col grow overflow-auto py-3" />
      <div class="-mx-3 row items-end justify-between p-1">
        <RichEditorToolbar editor={editor()} />
      </div>
    </div>
  );
}

export function RichEditorToolbar(props: {
  editor?: TiptapEditor;
  onFileAdded?: (event: { target: HTMLInputElement }) => void;
  isFileUploading?: boolean;
  class?: string;
}) {
  const t = T.useTranslate();

  const [isBold, isItalic, isUnderline, isBulletList, isOrderedList, isLink] = [
    'bold',
    'italic',
    'underline',
    'bulletList',
    'orderedList',
    'link',
  ].map((mark) =>
    createEditorTransaction(
      () => props.editor,
      (editor) => editor?.isActive(mark) ?? false,
    ),
  );

  const setLink = () => {
    const previousUrl = props.editor?.getAttributes('link').href;
    const url = window.prompt(t('linkTarget'), previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      props.editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      props.editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div class={clsx('row gap-1', props.class)}>
      <ToolbarItem
        title={t('bold')}
        icon={IconBold}
        active={isBold?.()}
        onClick={() => props.editor?.chain().focus().toggleBold().run()}
      />

      <ToolbarItem
        title={t('italic')}
        icon={IconItalic}
        active={isItalic?.()}
        onClick={() => props.editor?.chain().focus().toggleItalic().run()}
      />

      <ToolbarItem
        title={t('underline')}
        icon={IconUnderline}
        active={isUnderline?.()}
        onClick={() => props.editor?.chain().focus().toggleUnderline().run()}
      />

      <ToolbarItem title={t('link')} icon={IconLink} active={isLink?.()} onClick={setLink} />

      <ToolbarItem
        title={t('bulletList')}
        icon={IconListBullet}
        active={isBulletList?.()}
        onClick={() => props.editor?.chain().focus().toggleBulletList().run()}
      />

      <ToolbarItem
        title={t('orderedList')}
        icon={IconNumberedList}
        active={isOrderedList?.()}
        onClick={() => props.editor?.chain().focus().toggleOrderedList().run()}
      />

      <Show when={props.onFileAdded !== undefined}>
        <label
          role="button"
          class="rounded-sm p-0.5 aria-disabled:cursor-default"
          aria-disabled={props.isFileUploading}
        >
          <Dynamic
            component={props.isFileUploading ? Spinner : IconPaperClip}
            class="size-5 text-dim transition-colors hover:text-text"
          />
          <input
            type="file"
            onChange={(event) => props.onFileAdded?.(event)}
            disabled={props.isFileUploading}
            class="sr-only"
          />
        </label>
      </Show>
    </div>
  );
}

function ToolbarItem(props: { title: string; icon: ValidComponent; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      title={props.title}
      onClick={() => props.onClick?.()}
      class="rounded-sm p-0.5"
      classList={{
        'fill-icon/75': !props.active,
        'fill-primary bg-dim/10': props.active,
      }}
    >
      <Dynamic component={props.icon} class="size-5 text-dim transition-colors hover:text-text" />
    </button>
  );
}
