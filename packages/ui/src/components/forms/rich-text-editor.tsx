import { useFieldContext } from '@ark-ui/react/field';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import clsx from 'clsx';
import { cva } from 'cva';
import { createContext, use, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { definedAttributes, type Override } from '../../utils';
import { Icon, type IconName } from '../display/icon';

import { fieldBoxStyles } from './field-box';

type RichTextEditorRootProps = {
  /** The content as HTML, an empty string when the editor is empty. */
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Focuses the text, for a form library that focuses the first field in error. */
  ref?: React.Ref<{ focus: () => void }>;
  // Override the field's.
  id?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /** A RichTextEditor.Toolbar, under the text. */
  children?: React.ReactNode;
};

function RichTextEditorRoot({
  value,
  onChange,
  onBlur,
  placeholder,
  ref,
  children,
  ...props
}: RichTextEditorRootProps) {
  // The editable element is not a native control: it gets the textbox role, and the links and the states of Ark's
  // field context by hand. Its own props override them, like Field.Input's.
  const field = useFieldContext();
  const fieldProps = field?.getTextareaProps();
  const labelId = field?.getLabelProps().id;

  const disabled = props.disabled ?? field?.disabled ?? false;
  const required = props.required ?? field?.required ?? false;
  const invalid = props['aria-invalid'] ?? field?.invalid ?? false;

  // Only read when the editor is created; later values go through the effect below.
  const [initialValue] = useState(value);

  const [extensions] = useState(() => [
    // Only the formats of the toolbar: pasted content loses the others.
    StarterKit.configure({
      heading: false,
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      // Would add an empty paragraph at the end of the value.
      trailingNode: false,
      link: false,
    }),
    // Not inclusive: the text typed right after a link is not part of it.
    Link.extend({ inclusive: false }).configure({ openOnClick: false, defaultProtocol: 'https' }),
    // Reads the placeholder from the editable element, which gets the current one with its other attributes.
    Placeholder.configure({
      placeholder: ({ editor }) => editor.view.dom.getAttribute('aria-placeholder') ?? '',
    }),
  ]);

  const editor = useEditor({
    extensions,
    content: initialValue,
    editable: !disabled,
    immediatelyRender: true,
    editorProps: {
      attributes: definedAttributes({
        id: props.id ?? fieldProps?.id,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': props['aria-label'],
        'aria-labelledby':
          props['aria-labelledby'] ?? (props['aria-label'] === undefined ? labelId : undefined),
        'aria-describedby': props['aria-describedby'] ?? fieldProps?.['aria-describedby'],
        'aria-errormessage': invalid ? fieldProps?.['aria-errormessage'] : undefined,
        'aria-invalid': invalid ? 'true' : undefined,
        'aria-required': required ? 'true' : undefined,
        'aria-disabled': disabled ? 'true' : undefined,
        'aria-placeholder': placeholder,
        class: 'rich-text-editor prose prose-theme outline-none grow min-w-full',
      }),
    },
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => onChange(getValue(editor)),
    onBlur: () => onBlur?.(),
  });

  const focus = useCallback(() => editor.commands.focus(), [editor]);

  useImperativeHandle(ref, () => ({ focus }), [focus]);

  // A value set from outside (a reset after sending, for example) replaces the content.
  useEffect(() => {
    if (value !== getValue(editor)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor.setEditable(!disabled, false);
  }, [editor, disabled]);

  // The field's label points to the editable element, which a <label> cannot focus: a click on it does.
  useEffect(() => {
    const label = labelId === undefined ? null : document.getElementById(labelId);

    label?.addEventListener('click', focus);
    return () => label?.removeEventListener('click', focus);
  }, [focus, labelId]);

  return <RichTextEditorContext value={{ editor, disabled }}>{children}</RichTextEditorContext>;
}

// tiptap renders an empty editor as an empty paragraph.
function getValue(editor: Editor) {
  return editor.isEmpty ? '' : editor.getHTML();
}

type RichTextEditorContextValue = { editor: Editor; disabled: boolean };

const RichTextEditorContext = createContext<RichTextEditorContextValue | null>(null);

function useRichTextEditor() {
  const context = use(RichTextEditorContext);

  if (context === null) {
    throw new Error('The parts of a RichTextEditor must be inside a RichTextEditor.');
  }

  return context;
}

function RichTextEditorContent(props: React.ComponentProps<'div'>) {
  const { editor } = useRichTextEditor();

  return <EditorContent editor={editor} {...props} />;
}

type RichTextEditorTextareaProps = {
  toolbar?: React.ReactNode;
  className?: string;
};

function RichTextEditorTextarea({ toolbar, className }: RichTextEditorTextareaProps) {
  return (
    <div className={clsx(fieldBoxStyles, className)}>
      <RichTextEditorContent className="stack min-h-32 px-4 pt-3" />
      {toolbar && <div className="p-1">{toolbar}</div>}
    </div>
  );
}

/** The formatting buttons, under the text: the formats offered are the buttons it contains. */
function RichTextToolbar({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={clsx('row flex-wrap items-center gap-1', className)} />;
}

/** Actions at the end of the toolbar, such as an attachment button or the send button of a comment. */
function RichTextToolbarEnd({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={clsx('ml-auto row items-center gap-2', className)} />;
}

type FormatButtonProps = {
  label: string;
  className?: string;
};

function RichTextBold({ label, className }: FormatButtonProps) {
  const props = useFormatCommand('bold', 'toggleBold');
  return <RichTextToolbarButton {...props} icon="bold" label={label} className={className} />;
}

function RichTextItalic({ label, className }: FormatButtonProps) {
  const props = useFormatCommand('italic', 'toggleItalic');
  return <RichTextToolbarButton {...props} icon="italic" label={label} className={className} />;
}

function RichTextUnderline({ label, className }: FormatButtonProps) {
  const props = useFormatCommand('underline', 'toggleUnderline');
  return <RichTextToolbarButton {...props} icon="underline" label={label} className={className} />;
}

function RichTextBulletList({ label, className }: FormatButtonProps) {
  const props = useFormatCommand('bulletList', 'toggleBulletList');
  return <RichTextToolbarButton {...props} icon="bullet-list" label={label} className={className} />;
}

function RichTextOrderedList({ label, className }: FormatButtonProps) {
  const props = useFormatCommand('orderedList', 'toggleOrderedList');
  return <RichTextToolbarButton {...props} icon="ordered-list" label={label} className={className} />;
}

type FormatCommand =
  | 'toggleBold'
  | 'toggleItalic'
  | 'toggleUnderline'
  | 'toggleBulletList'
  | 'toggleOrderedList';

function useFormatCommand(format: string, command: FormatCommand) {
  const { editor } = useRichTextEditor();

  return {
    pressed: useEditorState({ editor, selector: ({ editor }) => editor.isActive(format) }),
    onClick: () => editor.chain().focus()[command]().run(),
  };
}

type RichTextLinkTarget = {
  href: string | undefined;
  setLink: (href: string) => boolean;
  removeLink: () => void;
  getElement: () => HTMLElement;
};

type RichTextLinkProps = {
  label: string;
  onClick: (target: RichTextLinkTarget) => void;
  className?: string;
};

function RichTextLink({ label, onClick, className }: RichTextLinkProps) {
  const { editor } = useRichTextEditor();
  const pressed = useEditorState({ editor, selector: ({ editor }) => editor.isActive('link') });

  const handleClick = () => {
    onClick({
      href: editor.getAttributes('link').href,
      setLink: (href) => setLink(editor, href),
      removeLink: () => removeLink(editor),
      getElement: () => getElement(editor),
    });
  };

  return (
    <RichTextToolbarButton
      icon="link"
      label={label}
      pressed={pressed}
      onClick={handleClick}
      className={className}
    />
  );
}

function setLink(editor: Editor, href: string) {
  // The link extension refuses unsafe addresses; the insertion below would not check them.
  if (!editor.can().setLink({ href })) {
    return false;
  }

  if (editor.state.selection.empty && !editor.isActive('link')) {
    editor
      .chain()
      .insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
      .run();
  } else {
    editor.chain().extendMarkRange('link').setLink({ href }).run();
  }

  return true;
}

function removeLink(editor: Editor) {
  editor.chain().extendMarkRange('link').unsetLink().run();
}

// Not inlined: the React Compiler would read editor.view.dom during render to memoize the callback,
// and tiptap throws until the view is mounted.
function getElement(editor: Editor) {
  return editor.view.dom;
}

type RichTextToolbarButtonProps = Override<
  React.ComponentProps<'button'>,
  {
    icon: IconName;
    /** Accessible name, also shown as a tooltip on hover. */
    label: string;
    pressed?: boolean;
    children?: never;
  }
>;

/** A button of the toolbar, for an action of the application (attaching a file). Disabled with the editor. */
function RichTextToolbarButton({
  icon,
  label,
  pressed,
  disabled: disabledProp,
  onMouseDown,
  className,
  ...props
}: RichTextToolbarButtonProps) {
  const context = use(RichTextEditorContext);
  const disabled = disabledProp ?? context?.disabled ?? false;

  return (
    <button
      type="button"
      {...props}
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      // Keeps the focus and the selection in the text on a mouse click.
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      className={toolbarButtonStyles({ state: getToolbarButtonState({ pressed, disabled }), className })}
    >
      <Icon name={icon} size="md" />
    </button>
  );
}

// The hit area extends 2px around, to 44px, like IconButton's sm size.
const toolbarButtonStyles = cva(
  'relative row size-control-sm items-center justify-center rounded-sm transition after:absolute after:-inset-0.5 focus-visible:focus-ring-inset',
  {
    variants: {
      state: {
        default: 'cursor-pointer text-muted hover:bg-surface-hover hover:text-default',
        pressed: 'cursor-pointer bg-primary-subtle text-primary hover:bg-primary-subtle-hover',
        disabled: 'cursor-not-allowed text-disabled',
      },
    },
  },
);

function getToolbarButtonState({ pressed, disabled }: { pressed?: boolean; disabled?: boolean }) {
  if (disabled) return 'disabled';
  if (pressed) return 'pressed';
  return 'default';
}

export {
  RichTextBold as Bold,
  RichTextBulletList as BulletList,
  RichTextEditorContent as EditorContent,
  RichTextItalic as Italic,
  RichTextLink as Link,
  RichTextOrderedList as OrderedList,
  RichTextEditorRoot as Root,
  RichTextEditorTextarea as Textarea,
  RichTextToolbar as Toolbar,
  RichTextToolbarButton as ToolbarButton,
  RichTextToolbarEnd as ToolbarEnd,
  RichTextUnderline as Underline,
  type RichTextLinkTarget as LinkTarget,
};
