/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

type PushPayload = {
  title: string;
  content: string;
  link: string;
};

void self.skipWaiting();

self.addEventListener('push', (event) => {
  const { title, content, link } = event.data!.json() as PushPayload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: content,
      icon: '/pwa-512x512.png',
      badge: '/logo-monochrome.png',
      data: { link },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { link } = event.notification.data as Pick<PushPayload, 'link'>;

  event.waitUntil(focusOrOpen(link));
});

async function focusOrOpen(link: string) {
  const clients = await self.clients.matchAll({ type: 'window' });
  const client = clients.find(({ url }) => new URL(url).href === new URL(link).href);

  if (client) {
    await client.focus();
  } else {
    await self.clients.openWindow(link);
  }
}
