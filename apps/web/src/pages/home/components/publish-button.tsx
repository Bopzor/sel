import { createSignal, For } from 'solid-js';
import { Dynamic, DynamicProps } from 'solid-js/web';

import { routes } from 'src/application/routes';
import { Button } from 'src/components/button';
import { Dialog, DialogHeader } from 'src/components/dialog';
import { Link } from 'src/components/link';
import { createTranslate } from 'src/intl/translate';

import { ContactMemberDialog } from './contact-member-dialog';
import { CreateInformationDialog } from './create-information-dialog';

const T = createTranslate('pages.home.publish');

export function PublishButton() {
  const [open, setOpen] = createSignal(false);
  const [createInfo, setCreateInfo] = createSignal(false);
  const [contactMember, setContactMember] = createSignal(false);

  const props = (
    type: 'request' | 'event' | 'information' | 'member',
  ): DynamicProps<typeof Link | 'button'> => {
    switch (type) {
      case 'request':
        return { component: Link, href: routes.requests.create };

      case 'event':
        return { component: Link, href: routes.events.create };

      case 'information':
        return {
          component: 'button',
          type: 'button',
          onClick: () => {
            setOpen(false);
            setCreateInfo(true);
          },
        };

      case 'member':
        return {
          component: 'button',
          type: 'button',
          onClick: () => {
            setOpen(false);
            setContactMember(true);
          },
        };
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <T id="button" />
      </Button>

      <Dialog open={open()} onClose={() => setOpen(false)} class="max-w-3xl">
        <DialogHeader title={<T id="dialog.title" />} onClose={() => setOpen(false)} />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <For each={['request', 'event', 'information', 'member'] as const}>
            {(type) => (
              <Dynamic
                {...props(type)}
                class="col gap-1 rounded-md border px-4 py-6 transition-shadow hover:shadow-md"
              >
                <div class="font-medium">
                  <T id={`dialog.${type}.label`} />
                </div>
                <div class="text-sm text-dim">
                  <T id={`dialog.${type}.description`} />
                </div>
              </Dynamic>
            )}
          </For>
        </div>
      </Dialog>

      <CreateInformationDialog open={createInfo()} onClose={() => setCreateInfo(false)} />
      <ContactMemberDialog open={contactMember()} onClose={() => setContactMember(false)} />
    </>
  );
}
