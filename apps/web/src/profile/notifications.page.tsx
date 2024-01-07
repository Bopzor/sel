import { Notification, isNotificationOfType } from '@sel/shared';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { xMark } from 'solid-heroicons/solid';
import { Component, For, Show } from 'solid-js';

import { Link } from '../components/link';
import { FormattedRelativeDate } from '../intl/formatted';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { getAppState } from '../store/app-store';

const T = Translate.prefix('profile.notifications');

export const NotificationsPage: Component = () => {
  const { notifications } = getAppState();

  return (
    <>
      <h1>
        <T id="title" />
      </h1>

      <For each={notifications}>
        {(notification) => <NotificationComponent notification={notification} />}
      </For>
    </>
  );
};

type NotificationComponentProps = {
  notification: Notification;
};

const NotificationComponent = (props: NotificationComponentProps) => {
  return (
    <div
      class={clsx('col max-w-xl gap-2 rounded-lg border-primary bg-neutral p-4 shadow')}
      classList={{ border: !props.notification.read, 'opacity-50': props.notification.read }}
    >
      <div class="row items-start justify-between gap-4">
        <div class="text-lg font-medium">{props.notification.title}</div>
        <button classList={{ hidden: props.notification.read }}>
          <Icon path={xMark} class="h-5 w-5" />
        </button>
      </div>

      <div>{props.notification.content}</div>

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
};

type NotificationLinkProps = {
  notification: Notification;
};

const NotificationLink = (props: NotificationLinkProps) => {
  return (
    <>
      {isNotificationOfType(props.notification, 'RequestCreated') && (
        <Link href={routes.requests.request(props.notification.data.request.id)}>Voir la demande</Link>
      )}
    </>
  );
};

const hasLink = (notification: Notification) => {
  return ['RequestCreated'].includes(notification.type);
};
