import { Event } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { bell, pencil } from 'solid-heroicons/solid';
import { createSignal, Show } from 'solid-js';

import { notify } from 'src/application/notify';
import { getIsAuthenticatedMember } from 'src/application/query';
import { routes } from 'src/application/routes';
import { ButtonMenuItem, LinkMenuItem, Menu } from 'src/components/menu';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.details.header');

export function EventHeader(props: { event: Event }) {
  return (
    <header>
      <div class="row items-center justify-between">
        <h2 class="text-2xl font-semibold lg:text-3xl">{props.event.title}</h2>
        <EventActions event={props.event} />
      </div>
    </header>
  );
}

function EventActions(props: { event: Event }) {
  const t = T.useTranslate();
  const [open, setOpen] = createSignal(false);

  const isAuthenticatedMember = getIsAuthenticatedMember();
  const isOrganizer = () => isAuthenticatedMember(props.event.organizer);

  return (
    <Menu open={open()} setOpen={setOpen} placement="bottom-end">
      <Show when={isOrganizer()}>
        <LinkMenuItem
          href={routes.events.edit(props.event.id)}
          start={<Icon path={pencil} class="size-4 text-dim" />}
          onClick={() => setOpen(false)}
        >
          <T id="actions.edit" />
        </LinkMenuItem>
      </Show>

      <ButtonMenuItem
        start={<Icon path={bell} class="size-4 text-dim" />}
        onClick={() => {
          notify.info(t('actions.notificationsSettingsUnavailable'));
          setOpen(false);
        }}
      >
        <T id="actions.notifications" />
      </ButtonMenuItem>
    </Menu>
  );
}
