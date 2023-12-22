import { Editor } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import { JSX, ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { createEditorTransaction, createTiptapEditor } from 'solid-tiptap';

import IconBold from '../icons/bold.svg';
import IconBulletList from '../icons/bullet-list.svg';
import IconItalic from '../icons/italic.svg';
import IconLink from '../icons/link.svg';
import IconOrderedList from '../icons/ordered-list.svg';
import IconUnderline from '../icons/underline.svg';
import { Translate } from '../intl/translate';

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
    ],
    content: props.initialValue,
    editorProps: {
      attributes: {
        class: 'outline-none grow prose dark:prose-invert',
      },
    },
    onUpdate({ editor }) {
      props.onChange?.(editor.getHTML());
    },
  }));
}

type RichEditorProps = {
  ref?: HTMLDivElement;
  class?: string;
  children?: JSX.Element;
};

export function RichEditor(props: RichEditorProps) {
  return (
    <div class={clsx('col resize-y overflow-auto', props.class)}>
      <div ref={props.ref} class="col grow overflow-y-auto" />
      {props.children}
    </div>
  );
}

type ToolbarProps = {
  editor?: Editor;
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
      (editor) => editor?.isActive(mark) ?? false
    )
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
    <div class="row gap-1">
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

      <ToolbarItem
        title={t('bulletList')}
        icon={IconBulletList}
        isActive={isBulletList()}
        onClick={() => props.editor?.chain().focus().toggleBulletList().run()}
      />

      <ToolbarItem
        title={t('orderedList')}
        icon={IconOrderedList}
        isActive={isOrderedList()}
        onClick={() => props.editor?.chain().focus().toggleOrderedList().run()}
      />

      <ToolbarItem title={t('link')} icon={IconLink} isActive={isLink()} onClick={setLink} />
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
      title={props.title}
      onClick={() => props.onClick()}
      class="rounded p-0.5"
      classList={{
        'fill-icon/75': !props.isActive,
        'fill-primary bg-dim/10': props.isActive,
      }}
    >
      <Dynamic component={props.icon} class="inline h-6 w-6" />
    </button>
  );
}
