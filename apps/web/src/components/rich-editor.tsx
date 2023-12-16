import { Editor } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Show, ValidComponent } from 'solid-js';
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

type RichEditorProps = {
  placeholder?: string;
  initialValue?: string;
  onChange?: (html: string) => void;
};

export function RichEditor(props: RichEditorProps) {
  let ref!: HTMLDivElement;

  const editor = createTiptapEditor(() => ({
    element: ref,
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
        class: 'outline-none grow prose',
      },
    },
    onUpdate() {
      const html = editor()?.getHTML();

      if (html) {
        props.onChange?.(html);
      }
    },
  }));

  return (
    // eslint-disable-next-line tailwindcss/no-arbitrary-value
    <div class="col min-h-[8rem] resize-y overflow-auto rounded bg-white shadow">
      <div ref={ref} class="col grow overflow-y-auto p-4" />
      <Show when={editor()}>{(editor) => <Toolbar editor={editor()} />}</Show>
    </div>
  );
}

type ToolbarProps = {
  editor: Editor;
};

function Toolbar(props: ToolbarProps) {
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
      (editor) => editor?.isActive(mark)
    )
  );

  const setLink = () => {
    const previousUrl = props.editor.getAttributes('link').href;
    const url = window.prompt(t('linkTarget'), previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div class="row gap-1 p-2">
      <ToolbarItem
        title={t('bold')}
        icon={IconBold}
        isActive={isBold()}
        onClick={() => props.editor.chain().focus().toggleBold().run()}
      />

      <ToolbarItem
        title={t('italic')}
        icon={IconItalic}
        isActive={isItalic()}
        onClick={() => props.editor.chain().focus().toggleItalic().run()}
      />

      <ToolbarItem
        title={t('underline')}
        icon={IconUnderline}
        isActive={isUnderline()}
        onClick={() => props.editor.chain().focus().toggleUnderline().run()}
      />

      <ToolbarItem
        title={t('bulletList')}
        icon={IconBulletList}
        isActive={isBulletList()}
        onClick={() => props.editor.chain().focus().toggleBulletList().run()}
      />

      <ToolbarItem
        title={t('orderedList')}
        icon={IconOrderedList}
        isActive={isOrderedList()}
        onClick={() => props.editor.chain().focus().toggleOrderedList().run()}
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
