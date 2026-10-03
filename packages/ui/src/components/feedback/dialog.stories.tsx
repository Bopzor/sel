import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FormEvent } from 'react';

import { Button } from '../actions/button';
import { FormField } from '../forms/form-field';
import { Input } from '../forms/input';

import * as Dialog from './dialog';

export default {
  title: 'Components/Feedback/Dialog',
  component: Dialog.Root,
  args: {
    alert: false,
    children: undefined,
  },
  argTypes: {
    children: { control: false },
  },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Dialog.Root {...args} open={open} onClose={close}>
          <Dialog.Content closeLabel="Close">
            <Dialog.Header>
              <Dialog.Title>Confirm the action?</Dialog.Title>
              <Dialog.Description>Description of the consequences of the action.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button variant={args.alert ? 'danger' : 'primary'} onClick={close}>
                Confirm
              </Button>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </>
    );
  },
} satisfies Meta<typeof Dialog.Root>;

type Story = StoryObj<typeof Dialog.Root>;

export const Playground: Story = {};

export const Alert: Story = {
  args: { alert: true },
};

/** A Dialog.Trigger opens the dialog and a Dialog.Close closes it: the dialog holds its own state. */
export const Uncontrolled: Story = {
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger>
        <Button>Open</Button>
      </Dialog.Trigger>
      <Dialog.Content closeLabel="Close">
        <Dialog.Header>
          <Dialog.Title>Confirm the action?</Dialog.Title>
          <Dialog.Description>Description of the consequences of the action.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button>Confirm</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

/** A form around the body and the footer: Enter in the field submits it, with the main action. */
export const WithForm: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const close = () => setOpen(false);

    const handleSubmit = (event: FormEvent) => {
      event.preventDefault();
      close();
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Dialog.Root {...args} open={open} onClose={close}>
          <Dialog.Content closeLabel="Close">
            <Dialog.Header>
              <Dialog.Title>Title of the form</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmit} className="contents">
              <Dialog.Body>
                <FormField label="Label">
                  <Input value={value} onChange={(event) => setValue(event.target.value)} />
                </FormField>
              </Dialog.Body>
              <Dialog.Footer>
                <Button type="submit">Save</Button>
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Root>
      </>
    );
  },
};

/** The body scrolls when the window is too small; the title and the buttons stay visible. */
export const LongContent: Story = {
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger>
        <Button>Open</Button>
      </Dialog.Trigger>
      <Dialog.Content closeLabel="Close">
        <Dialog.Header>
          <Dialog.Title>Title of the dialog</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body className="stack gap-4">
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index} className="text-body text-default">
              Paragraph {index + 1} of a content longer than the screen, which scrolls between the header and
              the footer.
            </p>
          ))}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close>
            <Button>Confirm</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

/** Information only: the close button is the only action. */
export const NoActions: Story = {
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger>
        <Button>Open</Button>
      </Dialog.Trigger>
      <Dialog.Content closeLabel="Close">
        <Dialog.Header>
          <Dialog.Title>Title of the dialog</Dialog.Title>
          <Dialog.Description>Information that does not ask for a choice.</Dialog.Description>
        </Dialog.Header>
      </Dialog.Content>
    </Dialog.Root>
  ),
};
