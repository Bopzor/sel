import { Dialog, DialogHeader } from 'src/components/dialog';

export function EventReminderDialog(props: { open: boolean; onClose: () => void }) {
  return (
    <Dialog {...props}>
      <DialogHeader title={'Yo'} onClose={props.onClose} />
    </Dialog>
  );
}
