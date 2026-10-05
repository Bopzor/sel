import { RichTextEditor } from '@sel/ui';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { renderTest } from 'src/tests/test-page';

import { RichTextToolbar } from './rich-text-toolbar';

describe('RichTextToolbar.Link', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let onSubmit: Mock<(event: React.SubmitEvent) => void>;

  beforeEach(() => {
    user = userEvent.setup();
    onSubmit = vi.fn((event: React.SubmitEvent) => event.preventDefault());
  });

  function renderEditor(initialValue = '') {
    renderTest(<Editor initialValue={initialValue} onSubmit={onSubmit} />);
  }

  it('inserts the address as a link, with https:// when it has no scheme', async () => {
    renderEditor();

    await user.click(getEditor());
    await openDialog();
    await user.type(getUrlInput(), 'example.org');
    await user.click(getDialogButton('Apply'));

    await waitForDialogClosed();

    const link = getEditor().querySelector('a');

    expect(link).toHaveAttribute('href', 'https://example.org');
    expect(link).toHaveTextContent('https://example.org');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit the form around the editor when Enter applies the link', async () => {
    renderEditor();

    await user.click(getEditor());
    await openDialog();
    await user.type(getUrlInput(), 'example.org{Enter}');

    await waitForDialogClosed();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('refuses an unsafe address and keeps the dialog open', async () => {
    renderEditor();

    await user.click(getEditor());
    await openDialog();
    await user.type(getUrlInput(), 'javascript:alert(1)');
    await user.click(getDialogButton('Apply'));

    expect(await screen.findByText('This URL is invalid')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // The modal dialog hides the rest of the page from the accessibility tree.
    expect(
      screen.getByRole('textbox', { name: 'Message', hidden: true }).querySelector('a'),
    ).not.toBeInTheDocument();
  });

  it('shows the address of the link at the selection, every time the dialog opens', async () => {
    renderEditor('<p><a href="https://a.org">a.org</a></p>');

    await placeCaretInLink();
    await openDialog();

    expect(getUrlInput()).toHaveValue('https://a.org');

    await user.click(getDialogButton('Cancel'));
    await waitForDialogClosed();

    await placeCaretInLink();
    await openDialog();

    expect(getUrlInput()).toHaveValue('https://a.org');
  });

  it('removes the link at the selection', async () => {
    renderEditor('<p><a href="https://a.org">a.org</a></p>');

    await placeCaretInLink();
    await openDialog();
    await user.click(getDialogButton('Remove link'));

    await waitForDialogClosed();

    expect(getEditor().querySelector('a')).not.toBeInTheDocument();
    expect(getEditor()).toHaveTextContent('a.org');
  });

  it('removes the link when the address is cleared', async () => {
    renderEditor('<p><a href="https://a.org">a.org</a></p>');

    await placeCaretInLink();
    await openDialog();
    await user.clear(getUrlInput());
    await user.click(getDialogButton('Apply'));

    await waitForDialogClosed();

    expect(getEditor().querySelector('a')).not.toBeInTheDocument();
  });

  function getEditor() {
    return screen.getByRole('textbox', { name: 'Message' });
  }

  function getUrlInput() {
    return within(screen.getByRole('dialog')).getByRole('textbox', { name: /^Link target/ });
  }

  function getDialogButton(name: string) {
    return within(screen.getByRole('dialog')).getByRole('button', { name });
  }

  async function openDialog() {
    await user.click(screen.getByRole('button', { name: 'Link' }));
    await screen.findByRole('dialog');
  }

  async function waitForDialogClosed() {
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  }

  // A click does not place the caret in happy-dom's contenteditable: the selection is set by hand.
  async function placeCaretInLink() {
    const text = getEditor().querySelector('a')?.firstChild;

    if (!text) {
      throw new Error('No link in the editor');
    }

    getEditor().focus();
    document.getSelection()?.setBaseAndExtent(text, 1, text, 1);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Link' })).toBePressed());
  }
});

type EditorProps = {
  initialValue: string;
  onSubmit: (event: React.SubmitEvent) => void;
};

function Editor({ initialValue, onSubmit }: EditorProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <form onSubmit={onSubmit}>
      <RichTextEditor.Root value={value} onChange={setValue} aria-label="Message">
        <RichTextEditor.Textarea
          toolbar={
            <RichTextEditor.Toolbar>
              <RichTextToolbar.Link />
            </RichTextEditor.Toolbar>
          }
        />
      </RichTextEditor.Root>
    </form>
  );
}
