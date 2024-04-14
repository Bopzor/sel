import { type Notification, isNotificationOfType } from '@sel/shared';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { xMark } from 'solid-heroicons/solid';
import { Show } from 'solid-js';

import { Link } from '../../../components/link';
import { FormattedRelativeDate } from '../../../intl/formatted';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';

const T = Translate.prefix('profile.notifications');

export function Notification(props: { notification: Notification; markAsRead: () => void }) {
  return (
    <div
      class={clsx('col card max-w-xl gap-2 border-primary p-4')}
      classList={{ border: !props.notification.read, 'opacity-50': props.notification.read }}
    >
      <div class="row items-start justify-between gap-4">
        <div class="text-lg font-medium">{props.notification.title}</div>
        <button
          type="button"
          classList={{ hidden: props.notification.read }}
          onClick={() => props.markAsRead()}
        >
          <Icon path={xMark} class="size-5" />
        </button>
      </div>

      <div class="line-clamp-4">{props.notification.content}</div>

      <div class="row gap-2 text-sm text-dim">
        <div>
          <FormattedRelativeDate date={props.notification.date} addSuffix />
        </div>

        <Show when={hasLink(props.notification)}>
          <div>&bullet;</div>
          <div>
            <NotificationLink notification={props.notification} />
          </div>
        </Show>
      </div>
    </div>
  );
}

function NotificationLink(props: { notification: Notification }) {
  return (
    <>
      {isNotificationOfType(props.notification, 'RequestCreated') && (
        <Link href={routes.requests.request(props.notification.entityId as string)}>
          <T id="viewRequest" />
        </Link>
      )}

      {isNotificationOfType(props.notification, 'RequestCommentCreated') && (
        <Link href={routes.requests.request(props.notification.entityId as string)}>
          <T id="viewRequest" />
        </Link>
      )}
    </>
  );
}

function hasLink(notification: Notification) {
  return ['RequestCreated', 'RequestCommentCreated'].includes(notification.type);
}
