import { Information } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { bell, pencil } from 'solid-heroicons/solid';
import { createSignal, Show } from 'solid-js';

import { notify } from 'src/application/notify';
import { getIsAuthenticatedMember } from 'src/application/query';
import { routes } from 'src/application/routes';
import { card } from 'src/components/card';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { ButtonMenuItem, LinkMenuItem, Menu } from 'src/components/menu';
import { FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.information.details.header');

export function InformationHeader(props: { information: Information }) {
  const publishedAt = (date: string) => <FormattedDate date={date} dateStyle="long" timeStyle="short" />;

  return (
    <header>
      <div class={card.header({ class: 'gap-2 row items-center justify-between' })}>
        <div class="col gap-2">
          <MemberAvatarName member={props.information.author} classes={{ root: card.title() }} />
          <div class="text-sm text-dim">
            <T id="date" values={{ date: publishedAt(props.information.publishedAt) }} />
          </div>
        </div>
        <InformationActions information={props.information} />
      </div>
    </header>
  );
}

function InformationActions(props: { information: Information }) {
  const t = T.useTranslate();
  const [open, setOpen] = createSignal(false);

  const isAuthenticatedMember = getIsAuthenticatedMember();
  const isAuthor = () => (props.information.author ? isAuthenticatedMember(props.information.author) : false);

  return (
    <Menu open={open()} setOpen={setOpen} placement="bottom-end">
      <Show when={isAuthor()}>
        <LinkMenuItem
          href={routes.information.edit(props.information.id)}
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
