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
  const href = new URL(link).href;
  const clients = await self.clients.matchAll({ type: 'window' });
  const client = clients.find(({ url }) => url === href) ?? clients[0];

  if (!client) {
    await self.clients.openWindow(href);
    return;
  }

  // Focused before navigating: the permission to focus a window only lasts for a short time after the click.
  const focused = await client.focus();

  if (focused.url !== href) {
    await focused.navigate(href);
  }
}
