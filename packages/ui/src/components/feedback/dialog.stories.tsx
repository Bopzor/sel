import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../actions/button';
import { Field } from '../forms/field';
import { Input } from '../forms/input';

import { Dialog } from './dialog';

export default {
  title: 'Components/Feedback/Dialog',
  component: Dialog,
  args: {
    open: false,
    title: 'Confirm the action?',
    description: 'Description of the consequences of the action.',
    closeLabel: 'Close',
    actions: null,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);
    const close = () => setOpen(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Dialog
          {...args}
          open={open}
          onClose={close}
          actions={
            <>
              <Button variant={args.alert ? 'danger' : 'primary'} onClick={close}>
                Confirm
              </Button>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
            </>
          }
        />
      </>
    );
  },
} satisfies Meta<typeof Dialog>;

type Story = StoryObj<typeof Dialog>;

export const Playground: Story = {};

export const Alert: Story = {
  args: {
    alert: true,
    title: 'Delete the item?',
    description: 'Description of what is lost, which cannot be undone.',
  },
};

export const WithForm: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const close = () => setOpen(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Dialog
          {...args}
          open={open}
          onClose={close}
          title="Title of the form"
          description={undefined}
          actions={
            <>
              <Button onClick={close}>Save</Button>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
            </>
          }
        >
          <Field label="Label">
            <Input value={value} onChange={(event) => setValue(event.target.value)} />
          </Field>
        </Dialog>
      </>
    );
  },
};
