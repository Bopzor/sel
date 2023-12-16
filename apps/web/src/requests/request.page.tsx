import { useIntl } from '@cookbook/solid-intl';
import { useParams } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { envelope, phone } from 'solid-heroicons/solid';
import { For, Show, onMount } from 'solid-js';

import { BackLink } from '../components/back-link';
import { Button } from '../components/button';
import { Link } from '../components/link';
import { SuspenseLoader } from '../components/loader';
import { MemberAvatarName } from '../components/member-avatar-name';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { getAppState, getMutations } from '../store/app-store';
import { formatPhoneNumber } from '../utils/format-phone-number';
import { notify } from '../utils/notify';

const T = Translate.prefix('requests');

export function RequestPage() {
  const intl = useIntl();
  const t = T.useTranslation();

  const { requestId } = useParams<{ requestId: string }>();

  const state = getAppState();
  const { loadRequest } = getMutations();

  onMount(() => loadRequest(requestId));

  return (
    <>
      <BackLink href={routes.requests.list} />

      <SuspenseLoader>
        <div class="col mb-6 gap-2">
          <h1>{state.request?.title}</h1>

          <div class="text-sm text-dim">
            <T
              id="date"
              values={{
                date: intl.formatDate(state.request?.date, {
                  dateStyle: 'long',
                  timeStyle: 'short',
                }),
              }}
            />
          </div>
        </div>

        <div class="row items-start gap-6">
          <div class="col flex-1 gap-6">
            <div
              class="prose max-w-none rounded-lg bg-neutral p-8 shadow"
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={state.request?.message}
            />
          </div>

          <div class="col max-w-sm flex-1 gap-6">
            <div class="col gap-4 rounded-lg bg-neutral p-4 pt-8 shadow">
              <Link
                unstyled
                href={routes.members.member(state.request?.author.id ?? '')}
                class="col items-center gap-2"
              >
                <MemberAvatarName
                  member={state.request?.author}
                  classes={{ avatar: '!w-16 !h-16', name: 'text-lg' }}
                />
              </Link>

              <ul class="col gap-1">
                <For each={state.request?.author.phoneNumbers}>
                  {({ number }) => (
                    <li class="row items-center gap-2">
                      <Icon class="h-4 w-4 text-icon" path={phone} />
                      <a class="unstyled" href={`tel:${number}`}>
                        {formatPhoneNumber(number)}
                      </a>
                    </li>
                  )}
                </For>

                <Show when={state.request?.author.email}>
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
                <T id="contact" values={{ author: state.request?.author?.firstName }} />
              </Button>
            </div>

            <Button variant="primary" onClick={() => notify.info(t('notAvailable'))}>
              <T id="createExchange" />
            </Button>
          </div>
        </div>
      </SuspenseLoader>
    </>
  );
}
