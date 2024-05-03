/// <reference lib="webworker" />
// cspell:words precache precaching

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
registerRoute(() => true, new NetworkFirst());

void self.skipWaiting();

self.addEventListener('push', function (event) {
  const { title, content, link } = event.data?.json() as {
    title: string;
    content: string;
    link: string;
  };

  event.waitUntil(
    self.registration.showNotification(title, {
      body: content,
      icon: '/logo-512.png',
      badge: '/logo-monochrome.png',
      data: {
        link,
      },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  notification.close();

  const { link } = notification.data as { link: string };

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
      })
      .then((clients) => {
        const matchingClient = clients.find(({ url }) => url === link);

        if (matchingClient && 'focus' in matchingClient) {
          return matchingClient.focus();
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(link);
        }
      }),
  );
});
