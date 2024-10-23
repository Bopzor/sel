import { createMutation } from '@tanstack/solid-query';
import { Editor } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import { ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { createEditorTransaction, createTiptapEditor } from 'solid-tiptap';
import ImageResize from 'tiptap-extension-resize-image';

import {
  IconBold,
  IconItalic,
  IconLink,
  IconListBullet,
  IconNumberedList,
  IconPaperClip,
  IconUnderline,
} from '../icons';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { TOKENS } from '../tokens';

const T = Translate.prefix('common.richEditor');

type CreateRichEditorProps = {
  placeholder?: string;
  initialValue?: string;
  onChange?: (html: string) => void;
};

export function createRichEditor(element: () => HTMLElement, props: CreateRichEditorProps) {
  return createTiptapEditor(() => ({
    element: element(),
    extensions: [
      StarterKit,
      Underline,
      Link,
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
      Image,
      ImageResize,
    ],
    content: props.initialValue,
    editorProps: {
      attributes: {
        class: 'outline-none grow prose max-w-none dark:prose-invert',
      },
    },
    onUpdate({ editor }) {
      props.onChange?.(editor.getHTML());
    },
  }));
}

type RichEditorProps = {
  placeholder?: string;
  initialValue?: string;
  onChange?: (html: string) => void;
};

export function RichEditor(props: RichEditorProps) {
  let ref!: HTMLDivElement;

  const editor = createRichEditor(() => ref, {
    placeholder: props.placeholder,
    initialValue: props.initialValue,
    onChange: (html) => props.onChange?.(html),
  });

  return (
    <div
      class={clsx(
        'col min-h-64 resize-y overflow-auto',
        'rounded-lg border-2',
        'border-transparent bg-neutral shadow',
        'transition-colors focus-within:border-primary/50',
      )}
    >
      <div ref={ref} class="col grow overflow-y-auto px-4 py-3" />

      <div class="row items-end justify-between p-1">
        <RichEditorToolbar editor={editor()} />
      </div>
    </div>
  );
}

type ToolbarProps = {
  editor?: Editor;
  class?: string;
};

export function RichEditorToolbar(props: ToolbarProps) {
  const t = T.useTranslation();

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
        isActive={isBold()}
        onClick={() => props.editor?.chain().focus().toggleBold().run()}
      />

      <ToolbarItem
        title={t('italic')}
        icon={IconItalic}
        isActive={isItalic()}
        onClick={() => props.editor?.chain().focus().toggleItalic().run()}
      />

      <ToolbarItem
        title={t('underline')}
        icon={IconUnderline}
        isActive={isUnderline()}
        onClick={() => props.editor?.chain().focus().toggleUnderline().run()}
      />

      <ToolbarItem title={t('link')} icon={IconLink} isActive={isLink()} onClick={setLink} />

      <ToolbarItem
        title={t('bulletList')}
        icon={IconListBullet}
        isActive={isBulletList()}
        onClick={() => props.editor?.chain().focus().toggleBulletList().run()}
      />

      <ToolbarItem
        title={t('orderedList')}
        icon={IconNumberedList}
        isActive={isOrderedList()}
        onClick={() => props.editor?.chain().focus().toggleOrderedList().run()}
      />

      <ToolbarItem
        title={t('upload')}
        icon={IconPaperClip}
        isActive={false}
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

type ToolbarItemProps = {
  title: string;
  icon: ValidComponent;
  isActive: boolean;
  onClick: () => void;
};

function ToolbarItem(props: ToolbarItemProps) {
  return (
    <button
      type="button"
      title={props.title}
      onClick={() => props.onClick()}
      class="rounded p-0.5"
      classList={{
        'fill-icon/75': !props.isActive,
        'fill-primary bg-dim/10': props.isActive,
      }}
    >
      <Dynamic component={props.icon} class="size-5 text-dim transition-colors hover:text-text" />
    </button>
  );
}

function createFileUploadHandler(editor: () => Editor | undefined) {
  const config = container.resolve(TOKENS.config);
  const api = container.resolve(TOKENS.api);

  const fileUpload = createMutation(() => ({
    async mutationFn(file: File) {
      return api.uploadFile({ files: { file } });
    },
    onSuccess(fileName) {
      editor()
        ?.chain()
        .createParagraphNear()
        .focus()
        .setImage({ src: `${config.api.url}/files/${fileName}` })
        .run();
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
