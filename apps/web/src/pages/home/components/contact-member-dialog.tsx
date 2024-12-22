import { routes } from 'src/application/routes';
import { Button, LinkButton } from 'src/components/button';
import { Dialog, DialogFooter, DialogHeader } from 'src/components/dialog';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.home.publish.contactMember');
const Translate = createTranslate('common');

export function ContactMemberDialog(props: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={props.open} onClose={() => props.onClose()} class="max-w-xl">
      <DialogHeader title={<T id="title" />} onClose={() => props.onClose()} />

      <p>
        <T id="description" />
      </p>

      <DialogFooter>
        <Button variant="outline" onClick={() => props.onClose()}>
          <Translate id="cancel" />
        </Button>
        <LinkButton href={routes.members.list}>
          <T id="button" />
        </LinkButton>
      </DialogFooter>
    </Dialog>
  );
}
