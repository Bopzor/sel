import { Request } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { envelope, phone } from 'solid-heroicons/solid';
import { For, Show } from 'solid-js';

import { Button } from '../../components/button';
import { Link } from '../../components/link';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { formatPhoneNumber } from '../../utils/format-phone-number';

const T = Translate.prefix('requests');

type AuthorInfoProps = {
  request?: Request;
};

export function AuthorInfo(props: AuthorInfoProps) {
  return (
    <div class="col gap-4 rounded-lg bg-neutral p-4 pt-8 shadow">
      <Link
        unstyled
        href={routes.members.member(props.request?.author.id ?? '')}
        class="col items-center gap-2"
      >
        <MemberAvatarName
          member={props.request?.author}
          classes={{ avatar: '!w-16 !h-16', name: 'text-lg' }}
        />
      </Link>

      <ul class="col gap-1">
        <For each={props.request?.author.phoneNumbers}>
          {({ number }) => (
            <li class="row items-center gap-2">
              <Icon class="h-4 w-4 text-icon" path={phone} />
              <a class="unstyled" href={`tel:${number}`}>
                {formatPhoneNumber(number)}
              </a>
            </li>
          )}
        </For>

        <Show when={props.request?.author.email}>
          {(email) => (
            <li class="row items-center gap-2">
              <Icon class="h-4 w-4 text-icon" path={envelope} />
              <a class="unstyled" href={`mailto:${email()}`}>
                {email()}
              </a>
            </li>
          )}
        </Show>
      </ul>

      <Button variant="secondary" class="self-start">
        <T id="contact" values={{ author: props.request?.author?.firstName }} />
      </Button>
    </div>
  );
}
