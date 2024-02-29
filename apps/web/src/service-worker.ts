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
  const { title, content } = event.data?.json() as { title: string; content: string };

  event.waitUntil(
    self.registration.showNotification(title, {
      body: content,
    }),
  );
});
