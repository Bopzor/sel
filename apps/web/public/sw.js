/* eslint-disable */

self.skipWaiting();

self.addEventListener('push', function (event) {
  const { title, content, link } = event.data.json();

  event.waitUntil(
    self.registration.showNotification(title, {
      body: content,
      icon: '/logo-512.png',
      badge: '/logo-monochrome.png',
      data: { link },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  notification.close();

  const { link } = notification.data;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window' })
      .then(async (clients) => {
        const matchingClient = clients.find(
          ({ url }) => new URL(url).toString() === new URL(link).toString(),
        );

        if (matchingClient && 'focus' in matchingClient) {
          await matchingClient.focus();
        } else if (self.clients.openWindow) {
          await self.clients.openWindow(link);
        }
      })
      .catch(console.error),
  );
});
