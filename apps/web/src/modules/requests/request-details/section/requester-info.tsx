import { Requester } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { envelope, phone } from 'solid-heroicons/solid';
import { For, Show } from 'solid-js';

import { isAuthenticatedMember } from '../../../../app-context';
import { Button } from '../../../../components/button';
import { Link } from '../../../../components/link';
import { MemberAvatarName } from '../../../../components/member-avatar-name';
import { Translate } from '../../../../intl/translate';
import { routes } from '../../../../routes';
import { formatPhoneNumber } from '../../../../utils/format-phone-number';

const T = Translate.prefix('requests');

export function RequesterInfo(props: { requester: Requester }) {
  return (
    <div class="card col gap-4 p-4 pt-8">
      <Link unstyled href={routes.members.member(props.requester.id)} class="col items-center gap-2">
        <MemberAvatarName member={props.requester} classes={{ avatar: '!size-24', name: 'text-lg' }} />
      </Link>

      <ul class="col gap-1">
        <PhoneNumbers requester={props.requester} />
        <Email requester={props.requester} />
      </ul>

      <Show when={!isAuthenticatedMember(props.requester)}>
        <Button variant="secondary" class="self-start">
          <T id="contact" values={{ requester: props.requester.firstName }} />
        </Button>
      </Show>
    </div>
  );
}

function PhoneNumbers(props: { requester: Requester }) {
  return (
    <For each={props.requester.phoneNumbers}>
      {({ number }) => (
        <li class="row items-center gap-2">
          <Icon class="size-4 text-icon" path={phone} />

          <a class="unstyled" href={`tel:${number}`}>
            {formatPhoneNumber(number)}
          </a>
        </li>
      )}
    </For>
  );
}

function Email(props: { requester: Requester }) {
  return (
    <Show when={props.requester.email}>
      {(email) => (
        <li class="row items-center gap-2">
          <Icon class="size-4 text-icon" path={envelope} />

          <a class="unstyled" href={`mailto:${email()}`}>
            {email()}
          </a>
        </li>
      )}
    </Show>
  );
}
