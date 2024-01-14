/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', function (event) {
  const { title, content } = event.data?.json() as { title: string; content: string };

  event.waitUntil(
    self.registration.showNotification(title, {
      body: content,
    })
  );
});
