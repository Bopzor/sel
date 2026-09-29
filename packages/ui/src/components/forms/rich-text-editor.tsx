import { Field, useFieldContext } from '@ark-ui/react/field';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import clsx from 'clsx';
import { cva } from 'cva';
import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';

import { Button } from '../actions/button';
import { Icon, type IconName } from '../display/icon';
import { Dialog } from '../feedback/dialog';

import { FieldError, FieldHint, FieldLabel, fieldBoxStyles, getFieldState } from './field';
import { TextField } from './text-field';

export type RichTextEditorLabels = {
  bold: string;
  italic: string;
  underline: string;
  /** The link button, also the title of the link dialog. */
  link: string;
  bulletList: string;
  orderedList: string;
  /** Label of the address field, in the link dialog. */
  linkUrl: string;
  /** Error of the address field, for an address that cannot be a link ("javascript:…"). */
  linkInvalid: string;
  linkApply: string;
  linkRemove: string;
  linkCancel: string;
  /** Accessible name of the link dialog's close button. */
  close: string;
};

export type RichTextEditorProps = {
  label: ReactNode;
  /** Help shown under the label, before the field. */
  hint?: ReactNode;
  /** What to do to fix the text; marks the field as invalid. */
  error?: ReactNode;
  /** The content as HTML, an empty string when the editor is empty. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  labels: RichTextEditorLabels;
  /** Actions at the end of the toolbar (attachment, send). */
  toolbarEnd?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
};

export function RichTextEditor({
  error,
  disabled = false,
  required = false,
  id,
  className,
  ...props
}: RichTextEditorProps) {
  return (
    <Field.Root
      id={id}
      invalid={Boolean(error)}
      disabled={disabled}
      required={required}
      className={clsx('flex flex-col gap-2', className)}
    >
      <FieldContent {...props} error={error} />
    </Field.Root>
  );
}

// Inside Field.Root, to read the ids and the state of the field.
function FieldContent({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder,
  labels,
  toolbarEnd,
}: Omit<RichTextEditorProps, 'disabled' | 'required' | 'id' | 'className'>) {
  const field = useFieldContext();
  const { disabled, invalid, required } = field;

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

  const { id: labelId } = field.getLabelProps();

  // The editable element is not a native control: it gets the textbox role and the links of Ark's Field by hand.
  const {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-errormessage': errorMessage,
  } = field.getTextareaProps();

  const editor = useEditor({
    extensions,
    content: initialValue,
    editable: !disabled,
    immediatelyRender: true,
    editorProps: {
      attributes: definedAttributes({
        id: controlId,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelId,
        'aria-describedby': describedBy,
        'aria-errormessage': errorMessage,
        'aria-invalid': invalid ? 'true' : undefined,
        'aria-required': required ? 'true' : undefined,
        'aria-disabled': disabled ? 'true' : undefined,
        'aria-placeholder': placeholder,
        class: 'rich-text-editor prose prose-theme max-w-none min-h-32 px-4 py-3 text-body outline-none',
      }),
    },
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => onChange(getValue(editor)),
  });

  // Controlled: a value set from outside (a reset after sending, for example) replaces the content.
  useEffect(() => {
    if (value !== getValue(editor)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor.setEditable(!disabled, false);
  }, [editor, disabled]);

  return (
    <>
      <div className="flex flex-col">
        <FieldLabel onClick={() => editor.commands.focus()}>{label}</FieldLabel>
        {hint && <FieldHint>{hint}</FieldHint>}
      </div>

      <div
        className={fieldBoxStyles({
          state: getFieldState({ disabled, invalid }),
          className: 'flex flex-col',
        })}
      >
        <EditorContent editor={editor} />
        <Toolbar editor={editor} labels={labels} disabled={disabled} end={toolbarEnd} />
      </div>

      <FieldError>{error}</FieldError>
    </>
  );
}

function Toolbar({
  editor,
  labels,
  disabled,
  end,
}: {
  editor: Editor;
  labels: RichTextEditorLabels;
  disabled: boolean;
  end: ReactNode;
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      link: editor.isActive('link'),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
    }),
  });

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [editingLink, setEditingLink] = useState(false);

  const openLink = () => {
    const href: string | undefined = editor.getAttributes('link').href;

    setLinkUrl(href ?? '');
    setEditingLink(href !== undefined);
    setLinkInvalid(false);
    setLinkOpen(true);
  };

  const applyLink = (event: FormEvent) => {
    // The dialog is rendered in a portal, but React still bubbles its submit event to a form around the editor.
    event.preventDefault();
    event.stopPropagation();

    const href = toHref(linkUrl.trim());

    // The link extension refuses unsafe addresses; the insertion below would not check them.
    if (href !== '' && !editor.can().setLink({ href })) {
      setLinkInvalid(true);
      return;
    }

    if (href === '') {
      editor.chain().extendMarkRange('link').unsetLink().run();
    } else if (editor.state.selection.empty && !editor.isActive('link')) {
      editor
        .chain()
        .insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
        .run();
    } else {
      editor.chain().extendMarkRange('link').setLink({ href }).run();
    }

    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().extendMarkRange('link').unsetLink().run();
    setLinkOpen(false);
  };

  const formId = useId();

  return (
    <div className="flex flex-wrap items-center gap-1 border-t p-1">
      <ToolbarButton
        icon="bold"
        label={labels.bold}
        pressed={active.bold}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon="italic"
        label={labels.italic}
        pressed={active.italic}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        icon="underline"
        label={labels.underline}
        pressed={active.underline}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        icon="link"
        label={labels.link}
        pressed={active.link}
        disabled={disabled}
        onClick={openLink}
      />
      <ToolbarButton
        icon="bullet-list"
        label={labels.bulletList}
        pressed={active.bulletList}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        icon="ordered-list"
        label={labels.orderedList}
        pressed={active.orderedList}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />

      {end && <div className="ml-auto flex items-center gap-2">{end}</div>}

      <Dialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title={labels.link}
        closeLabel={labels.close}
        finalFocus={() => editor.view.dom}
        actions={
          <>
            <Button type="submit" form={formId}>
              {labels.linkApply}
            </Button>
            {editingLink && (
              <Button variant="secondary" onClick={removeLink}>
                {labels.linkRemove}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setLinkOpen(false)}>
              {labels.linkCancel}
            </Button>
          </>
        }
      >
        {/* noValidate: an address without a scheme is not a valid url for the browser, and gets https:// here. */}
        <form id={formId} onSubmit={applyLink} noValidate>
          <TextField
            label={labels.linkUrl}
            value={linkUrl}
            error={linkInvalid ? labels.linkInvalid : undefined}
            onChange={setLinkUrl}
            type="url"
            inputMode="url"
            autoComplete="url"
          />
        </form>
      </Dialog>
    </div>
  );
}

export function ToolbarButton({
  icon,
  label,
  pressed,
  disabled,
  onClick,
}: {
  icon: IconName;
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      // Keeps the focus and the selection in the text on a mouse click.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={toolbarButtonStyles({ state: getToolbarButtonState({ pressed, disabled }) })}
    >
      <Icon name={icon} size="md" />
    </button>
  );
}

// The hit area extends 2px around, to 44px, like IconButton's sm size.
const toolbarButtonStyles = cva(
  'relative flex size-control-sm items-center justify-center rounded-md transition after:absolute after:-inset-0.5 focus-visible:focus-ring-inset',
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

// tiptap renders an empty editor as an empty paragraph.
function getValue(editor: Editor) {
  return editor.isEmpty ? '' : editor.getHTML();
}

// An address typed without a scheme ("example.org") is a web address, not a path.
function toHref(url: string) {
  if (url === '' || /^[a-z][a-z\d+.-]*:/i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

// ProseMirror writes every attribute it receives, "undefined" included.
function definedAttributes(attributes: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(attributes).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}
