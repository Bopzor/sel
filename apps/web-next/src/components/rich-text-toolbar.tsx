import { Trans, useLingui } from '@lingui/react/macro';
import { Button, Dialog, RichTextEditor } from '@sel/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useFileInput } from 'src/hooks/use-file-input';

import { InputField } from './fields';

type ToolbarItemProps = {
  className?: string;
};

function Bold({ className }: ToolbarItemProps) {
  const { t } = useLingui();
  return <RichTextEditor.Bold label={t`Bold`} className={className} />;
}

function Italic({ className }: ToolbarItemProps) {
  const { t } = useLingui();
  return <RichTextEditor.Italic label={t`Italic`} className={className} />;
}

function Underline({ className }: ToolbarItemProps) {
  const { t } = useLingui();
  return <RichTextEditor.Underline label={t`Underline`} className={className} />;
}

function Link({ className }: ToolbarItemProps) {
  const { t } = useLingui();

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<RichTextEditor.LinkTarget>();

  const openDialog = (target: RichTextEditor.LinkTarget) => {
    setTarget(target);
    setOpen(true);
  };

  return (
    <>
      <RichTextEditor.Link label={t`Link`} onClick={openDialog} className={className} />

      <Dialog.Root open={open} onClose={() => setOpen(false)} finalFocus={() => target?.getElement() ?? null}>
        <Dialog.Content closeLabel={t`Close`}>
          <Dialog.Header>
            <Dialog.Title>
              <Trans>Link</Trans>
            </Dialog.Title>
          </Dialog.Header>
          <LinkDialogForm onClose={() => setOpen(false)} target={target} />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

function BulletList({ className }: ToolbarItemProps) {
  const { t } = useLingui();
  return <RichTextEditor.BulletList label={t`Bulleted list`} className={className} />;
}

function OrderedList({ className }: ToolbarItemProps) {
  const { t } = useLingui();
  return <RichTextEditor.OrderedList label={t`Numbered list`} className={className} />;
}

function Attachment({ onSelect, className }: ToolbarItemProps & { onSelect: (files: File[]) => void }) {
  const { t } = useLingui();
  const fileInput = useFileInput(onSelect);

  return (
    <>
      <RichTextEditor.ToolbarButton
        icon="attachment"
        label={t`Attach files`}
        onClick={fileInput.open}
        className={className}
      />
      {fileInput.input}
    </>
  );
}

export const RichTextToolbar = {
  Bold,
  Italic,
  Underline,
  Link,
  BulletList,
  OrderedList,
  Attachment,
};

type LinkDialogProps = {
  onClose: () => void;
  target?: RichTextEditor.LinkTarget;
};

function LinkDialogForm({ onClose, target }: LinkDialogProps) {
  const { t } = useLingui();

  const form = useForm({
    defaultValues: { url: target?.href ?? '' },
  });

  const apply = form.handleSubmit(({ url }) => {
    const href = toHref(url.trim());

    if (href === '') {
      target?.removeLink();
    } else if (target?.setLink(href) === false) {
      form.setError('url', { message: t`This URL is invalid` });
      return;
    }

    onClose();
  });

  const remove = () => {
    target?.removeLink();
    onClose();
  };

  return (
    // noValidate: an address without a scheme is not a valid url for the browser, and gets https:// here.
    <form
      onSubmit={(event) => {
        // The dialog is rendered in a portal, but React still bubbles its submit event to a form around the editor.
        event.stopPropagation();
        void apply(event);
      }}
      noValidate
      className="contents"
    >
      <Dialog.Body>
        <InputField
          control={form.control}
          name="url"
          label={<Trans>Link target</Trans>}
          type="url"
          inputMode="url"
          autoComplete="url"
        />
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="submit">
          <Trans>Apply</Trans>
        </Button>

        {target?.href !== undefined && (
          <Button variant="secondary" onClick={remove}>
            <Trans>Remove link</Trans>
          </Button>
        )}

        <Button variant="secondary" onClick={onClose}>
          <Trans>Cancel</Trans>
        </Button>
      </Dialog.Footer>
    </form>
  );
}

function toHref(url: string) {
  if (url === '' || /^[a-z][a-z\d+.-]*:/i.test(url)) {
    return url;
  }

  return `https://${url}`;
}
