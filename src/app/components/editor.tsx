import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { BubbleMenu, EditorContent, useEditor, Editor as TipTapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import { useState } from 'react';

import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import 'tippy.js/dist/svg-arrow.css';

type EditorProps = {
  placeholder?: string;
  initialHtml?: string;
  onChange: (html: string) => void;
};

export const Editor = ({ placeholder, initialHtml, onChange }: EditorProps) => {
  const editor = useEditor({
    content: initialHtml,
    editorProps: {
      attributes: {
        class: 'outline-none flex-1',
      },
    },
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        hardBreak: false,
        listItem: {
          HTMLAttributes: {
            class: '[&>p]:my-0',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
  });

  if (!editor) {
    // eslint-disable-next-line tailwindcss/no-arbitrary-value
    return <textarea className="min-h-[20rem] rounded" />;
  }

  return (
    <div className="rounded bg-neutral focus-within:shadow">
      <Toolbar editor={editor} />

      <LinkBubbleMenu editor={editor} />

      <EditorContent
        editor={editor}
        placeholder={placeholder}
        onBlur={() => onChange(editor.getHTML())}
        // eslint-disable-next-line tailwindcss/no-arbitrary-value
        className="col prose h-[16rem] max-w-none resize-y overflow-y-auto px-1"
      />
    </div>
  );
};

type LinkBubbleMenuProps = {
  editor: TipTapEditor;
};

const LinkBubbleMenu = ({ editor }: LinkBubbleMenuProps) => {
  const [linkTarget, setLinkTarget] = useState('');

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={() => editor.isActive('link')}
      tippyOptions={{
        delay: [500, null],
        duration: 200,
        onShow: () => setLinkTarget(editor.getAttributes('link').href),
        onDestroy: () => setLinkTarget(''),
      }}
    >
      <div className="col gap-0.5 rounded border bg-neutral py-0.5 px-1 shadow">
        <div className="text-xs font-semibold text-muted">Lien vers :</div>
        <input
          // eslint-disable-next-line tailwindcss/no-arbitrary-value
          className="min-w-[12rem] rounded border py-[4px] px-0.5 outline-none"
          placeholder="https://..."
          value={linkTarget}
          onChange={(e) => {
            setLinkTarget(e.target.value);
            editor.chain().extendMarkRange('link').setLink({ href: e.target.value }).run();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        />
      </div>
    </BubbleMenu>
  );
};

type ToolbarProps = {
  editor: TipTapEditor;
};

const Toolbar = ({ editor }: ToolbarProps) => (
  <div className="row gap-0.5 border-b p-1">
    <ToolbarItem
      icon="bold"
      active={editor.isActive('bold')}
      disabled={!editor.can().chain().focus().toggleBold().run()}
      onClick={() => editor.chain().focus().toggleBold().run()}
    />

    <ToolbarItem
      icon="italic"
      active={editor.isActive('italic')}
      disabled={!editor.can().chain().focus().toggleItalic().run()}
      onClick={() => editor.chain().focus().toggleItalic().run()}
    />

    <ToolbarItem
      icon="underline"
      active={editor.isActive('underline')}
      disabled={!editor.can().chain().focus().toggleUnderline().run()}
      onClick={() => editor.chain().focus().toggleUnderline().run()}
    />

    <ToolbarItem
      icon="strikethrough"
      active={editor.isActive('strike')}
      disabled={!editor.can().chain().focus().toggleStrike().run()}
      onClick={() => editor.chain().focus().toggleStrike().run()}
    />

    <div className="border-x" />

    <ToolbarItem
      icon="link"
      active={editor.isActive('list')}
      disabled={!editor.can().chain().focus().toggleLink({ href: '' }).run()}
      onClick={() => editor.chain().focus().toggleLink({ href: '' }).run()}
    />

    <ToolbarItem
      icon="list-ul"
      active={editor.isActive('bulletList')}
      disabled={!editor.can().chain().focus().toggleBulletList().run()}
      onClick={() => editor.chain().focus().toggleBulletList().run()}
    />

    <ToolbarItem
      icon="list-ol"
      active={editor.isActive('orderedList')}
      disabled={!editor.can().chain().focus().toggleOrderedList().run()}
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
    />
  </div>
);

type ToolbarItemProps = {
  icon: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
};

const ToolbarItem = ({ icon, active, disabled, onClick }: ToolbarItemProps) => (
  <button
    type="button"
    disabled={disabled}
    className={clsx(
      'col h-1.5 w-1.5 items-center justify-center rounded-xs px-1 text-icon',
      active ? 'bg-inverted/10' : 'hover:bg-inverted/5'
    )}
    onClick={onClick}
  >
    {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
    <i className={`fa-solid fa-${icon}`} />
  </button>
);
