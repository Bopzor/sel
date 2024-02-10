import { Notification } from '@sel/shared';
import { For, Show, createResource } from 'solid-js';

import { getAppActions } from '../../../app-context';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { createAsyncCall } from '../../../utils/async-call';

import { Notification as NotificationItem } from './notification';

const T = Translate.prefix('profile.notifications');

export default function NotificationsPage() {
  const profileApi = container.resolve(TOKENS.profileApi);
  const [notifications, { refetch }] = createResource(profileApi.getNotifications.bind(profileApi));
  const { refreshNotificationsCount } = getAppActions();

  return (
    <>
      <h1>
        <T id="title" />
      </h1>

      <Show when={notifications.latest}>
        {(notifications) => (
          <NotificationsList
            notifications={notifications()[1]}
            onMarkedAsRead={() => {
              void refetch();
              refreshNotificationsCount();
            }}
          />
        )}
      </Show>
    </>
  );
}

function NotificationsList(props: { notifications: Notification[]; onMarkedAsRead: () => void }) {
  const profileApi = container.resolve(TOKENS.profileApi);

  const [markNotificationAsRead] = createAsyncCall(profileApi.markNotificationAsRead.bind(profileApi), {
    onSuccess: props.onMarkedAsRead,
  });

  return (
    <For each={props.notifications}>
      {(notification) => (
        <NotificationItem
          notification={notification}
          markAsRead={() => void markNotificationAsRead(notification.id)}
        />
      )}
    </For>
  );
}
