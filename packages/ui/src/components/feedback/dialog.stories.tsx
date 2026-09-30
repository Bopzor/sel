import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FormEvent } from 'react';

import { Button } from '../actions/button';
import { Field } from '../forms/field';
import { Input } from '../forms/input';

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

export default {
  title: 'Components/Feedback/Dialog',
  component: Dialog,
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
        <Dialog {...args} open={open} onClose={close}>
          <DialogContent closeLabel="Close">
            <DialogHeader>
              <DialogTitle>Confirm the action?</DialogTitle>
              <DialogDescription>Description of the consequences of the action.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant={args.alert ? 'danger' : 'primary'} onClick={close}>
                Confirm
              </Button>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
} satisfies Meta<typeof Dialog>;

type Story = StoryObj<typeof Dialog>;

export const Playground: Story = {};

export const Alert: Story = {
  args: { alert: true },
};

/** A DialogTrigger opens the dialog and a DialogClose closes it: the dialog holds its own state. */
export const Uncontrolled: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent closeLabel="Close">
        <DialogHeader>
          <DialogTitle>Confirm the action?</DialogTitle>
          <DialogDescription>Description of the consequences of the action.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button>Confirm</Button>
          </DialogClose>
          <DialogClose>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        <Dialog {...args} open={open} onClose={close}>
          <DialogContent closeLabel="Close">
            <DialogHeader>
              <DialogTitle>Title of the form</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="contents">
              <DialogBody>
                <Field label="Label">
                  <Input value={value} onChange={(event) => setValue(event.target.value)} />
                </Field>
              </DialogBody>
              <DialogFooter>
                <Button type="submit">Save</Button>
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

/** The body scrolls when the window is too small; the title and the buttons stay visible. */
export const LongContent: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent closeLabel="Close">
        <DialogHeader>
          <DialogTitle>Title of the dialog</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index} className="text-body text-default">
              Paragraph {index + 1} of a content longer than the screen, which scrolls between the header and
              the footer.
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose>
            <Button>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** Information only: the close button is the only action. */
export const NoActions: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent closeLabel="Close">
        <DialogHeader>
          <DialogTitle>Title of the dialog</DialogTitle>
          <DialogDescription>Information that does not ask for a choice.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
