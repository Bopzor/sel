import { useFieldContext } from '@ark-ui/react/field';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import clsx from 'clsx';
import { cva } from 'cva';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
  type Ref,
} from 'react';

import { definedAttributes, type Override } from '../../utils';
import { Button } from '../actions/button';
import { Icon, type IconName } from '../display/icon';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../feedback/dialog';

import { Field, fieldBoxStyles } from './field';
import { Input } from './input';

export type RichTextEditorProps = {
  /** The content as HTML, an empty string when the editor is empty. */
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** A RichTextToolbar, under the text. */
  children?: ReactNode;
  /** Focuses the text, for a form library that focuses the first field in error. */
  ref?: Ref<{ focus: () => void }>;
  // Override the field's.
  id?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  children,
  ref,
  className,
  ...props
}: RichTextEditorProps) {
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
        class: 'rich-text-editor prose prose-theme max-w-none min-h-32 px-4 py-3 text-body outline-none',
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

  return (
    <RichTextEditorContext value={{ editor, disabled }}>
      <div className={clsx(fieldBoxStyles, 'flex flex-col', className)}>
        <EditorContent editor={editor} />
        {children}
      </div>
    </RichTextEditorContext>
  );
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

export type RichTextToolbarProps = ComponentProps<'div'>;

/** The formatting buttons, under the text: the formats offered are the buttons it contains. */
export function RichTextToolbar({ className, ...props }: RichTextToolbarProps) {
  return <div {...props} className={clsx('flex flex-wrap items-center gap-1 border-t p-1', className)} />;
}

export type RichTextToolbarEndProps = ComponentProps<'div'>;

/** Actions at the end of the toolbar, such as an attachment button or the send button of a comment. */
export function RichTextToolbarEnd({ className, ...props }: RichTextToolbarEndProps) {
  return <div {...props} className={clsx('ml-auto flex items-center gap-2', className)} />;
}

export type RichTextFormatProps = {
  /** Accessible name of the button, in the application's language. */
  label: string;
};

export function RichTextBold({ label }: RichTextFormatProps) {
  return (
    <FormatButton
      icon="bold"
      label={label}
      format="bold"
      run={(editor) => editor.chain().focus().toggleBold().run()}
    />
  );
}

export function RichTextItalic({ label }: RichTextFormatProps) {
  return (
    <FormatButton
      icon="italic"
      label={label}
      format="italic"
      run={(editor) => editor.chain().focus().toggleItalic().run()}
    />
  );
}

export function RichTextUnderline({ label }: RichTextFormatProps) {
  return (
    <FormatButton
      icon="underline"
      label={label}
      format="underline"
      run={(editor) => editor.chain().focus().toggleUnderline().run()}
    />
  );
}

export function RichTextBulletList({ label }: RichTextFormatProps) {
  return (
    <FormatButton
      icon="bullet-list"
      label={label}
      format="bulletList"
      run={(editor) => editor.chain().focus().toggleBulletList().run()}
    />
  );
}

export function RichTextOrderedList({ label }: RichTextFormatProps) {
  return (
    <FormatButton
      icon="ordered-list"
      label={label}
      format="orderedList"
      run={(editor) => editor.chain().focus().toggleOrderedList().run()}
    />
  );
}

type FormatButtonProps = RichTextFormatProps & {
  icon: IconName;
  /** The name of tiptap's mark or node, which makes the button pressed when the selection has it. */
  format: string;
  run: (editor: Editor) => void;
};

function FormatButton({ icon, label, format, run }: FormatButtonProps) {
  const { editor } = useRichTextEditor();
  const pressed = useEditorState({ editor, selector: ({ editor }) => editor.isActive(format) });

  return <RichTextToolbarButton icon={icon} label={label} pressed={pressed} onClick={() => run(editor)} />;
}

export type RichTextLinkLabels = {
  /** The link button, also the title of the link dialog. */
  button: string;
  /** Label of the address field. */
  url: string;
  /** Error of the address field, for an address that cannot be a link ("javascript:…"). */
  invalid: string;
  apply: string;
  remove: string;
  cancel: string;
  /** Accessible name of the dialog's close button. */
  close: string;
};

export type RichTextLinkProps = {
  /** The texts of the button and of its dialog, in the application's language. */
  labels: RichTextLinkLabels;
};

/** The link button, which opens a dialog with the address. */
export function RichTextLink({ labels }: RichTextLinkProps) {
  const { editor } = useRichTextEditor();
  const pressed = useEditorState({ editor, selector: ({ editor }) => editor.isActive('link') });

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [editing, setEditing] = useState(false);

  const openDialog = () => {
    const href: string | undefined = editor.getAttributes('link').href;

    setUrl(href ?? '');
    setEditing(href !== undefined);
    setInvalid(false);
    setOpen(true);
  };

  const apply = (event: FormEvent) => {
    // The dialog is rendered in a portal, but React still bubbles its submit event to a form around the editor.
    event.preventDefault();
    event.stopPropagation();

    const href = toHref(url.trim());

    // The link extension refuses unsafe addresses; the insertion below would not check them.
    if (href !== '' && !editor.can().setLink({ href })) {
      setInvalid(true);
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

    setOpen(false);
  };

  const remove = () => {
    editor.chain().extendMarkRange('link').unsetLink().run();
    setOpen(false);
  };

  return (
    <>
      <RichTextToolbarButton icon="link" label={labels.button} pressed={pressed} onClick={openDialog} />

      <Dialog open={open} onClose={() => setOpen(false)} finalFocus={() => editor.view.dom}>
        <DialogContent closeLabel={labels.close}>
          <DialogHeader>
            <DialogTitle>{labels.button}</DialogTitle>
          </DialogHeader>

          {/* noValidate: an address without a scheme is not a valid url for the browser, and gets https:// here. */}
          <form onSubmit={apply} noValidate className="contents">
            <DialogBody>
              <Field label={labels.url} error={invalid ? labels.invalid : undefined}>
                <Input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                />
              </Field>
            </DialogBody>

            <DialogFooter>
              <Button type="submit">{labels.apply}</Button>
              {editing && (
                <Button variant="secondary" onClick={remove}>
                  {labels.remove}
                </Button>
              )}
              <Button variant="secondary" onClick={() => setOpen(false)}>
                {labels.cancel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export type RichTextToolbarButtonProps = Override<
  ComponentProps<'button'>,
  {
    children?: never;
    icon: IconName;
    /** Accessible name, also shown as a tooltip on hover. */
    label: string;
    pressed?: boolean;
  }
>;

/** A button of the toolbar, for an action of the application (attaching a file). Disabled with the editor. */
export function RichTextToolbarButton({
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
