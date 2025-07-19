import { useMutation } from '@tanstack/solid-query';
import { Editor } from '@tiptap/core';
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
import { JSX, splitProps, ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { createEditorTransaction, createTiptapEditor } from 'solid-tiptap';

import { api } from 'src/application/api';
import { createTranslate } from 'src/intl/translate';
import { createId } from 'src/utils/id';

import { field, FieldVariant } from './field';
import { FormControl } from './form-control';

const T = createTranslate('components.richEditor');

type CreateRichEditorProps = {
  element: () => HTMLElement;
  placeholder?: string;
  initialValue?: string;
  onChange?: (html: string) => void;
};

export function createRichEditor(props: CreateRichEditorProps) {
  return createTiptapEditor(() => ({
    element: props.element(),
    extensions: [
      StarterKit,
      Underline,
      Link,
      Placeholder.configure({ placeholder: props.placeholder }),
      Image,
    ],
    content: props.initialValue,
    editorProps: {
      attributes: {
        class: 'outline-hidden grow prose max-w-none dark:prose-invert',
      },
    },
    onUpdate({ editor }) {
      props.onChange?.(editor.getHTML());
    },
  }));
}

type RichEditorProps = CreateRichEditorProps & {
  id?: string;
  variant?: FieldVariant;
  label?: JSX.Element;
  error?: JSX.Element;
};

export function RichEditor(_props: Omit<RichEditorProps, 'element'>) {
  const [formControlProps, fieldProps, props] = splitProps(_props, ['label', 'error'], ['variant']);

  const id = createId(() => props.id);
  let ref!: HTMLDivElement;

  const editor = createRichEditor({ ...props, element: () => ref });

  return (
    <FormControl id={id()} {...formControlProps}>
      <div class={field({ ...fieldProps, class: 'col items-stretch h-48 resize-y overflow-auto' })}>
        <div
          ref={ref}
          aria-invalid={Boolean(formControlProps.error)}
          aria-errormessage={formControlProps.error ? `${id()}-helper-text` : undefined}
          id={id()}
          class="col grow overflow-y-auto px-4 py-3"
        />

        <div class="row items-end justify-between p-1">
          <RichEditorToolbar editor={editor()} />
        </div>
      </div>
    </FormControl>
  );
}

export function RichEditorToolbar(props: { editor?: Editor; class?: string }) {
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

  let fileInput!: HTMLInputElement;
  const handleFileUpload = createFileUploadHandler(() => props.editor);

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

      <ToolbarItem
        title={t('upload')}
        icon={IconPaperClip}
        active={false}
        onClick={() => fileInput.click()}
      />

      <form onSubmit={handleFileUpload} class="sr-only">
        <input
          ref={fileInput}
          name="file"
          type="file"
          onChange={(event) => event.target.form?.requestSubmit()}
        />
      </form>
    </div>
  );
}

function ToolbarItem(props: { title: string; icon: ValidComponent; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={props.title}
      onClick={() => props.onClick()}
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

function createFileUploadHandler(editor: () => Editor | undefined) {
  const fileUpload = useMutation(() => ({
    async mutationFn(file: File) {
      const fileName = await api.uploadFile({ files: { file } });

      return {
        originalFileName: file.name,
        fileName,
      };
    },
    onSuccess({ originalFileName, fileName }) {
      const chain = editor()?.chain();

      if (!chain) {
        return;
      }

      chain.createParagraphNear().focus().run();

      if (fileName.endsWith('.pdf')) {
        chain
          .insertContent({ type: 'text', text: originalFileName })
          .selectParentNode()
          .setLink({ href: `/api/files/${fileName}`, target: '_blank' });
      } else {
        chain.setImage({ src: `/api/files/${fileName}` });
      }

      chain.run();
    },
  }));

  return (event: SubmitEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const file = new FormData(form).get('file') as File;

    fileUpload.mutate(file);

    form.reset();
  };
}
