import { useSyncExternalStore } from 'react';

import { subscribeColorScheme } from 'src/app/color-scheme';

export function ThemeColor() {
  const color = useSyncExternalStore(
    subscribeColorScheme,
    () => getComputedStyle(document.body).backgroundColor,
  );

  return <meta name="theme-color" content={color} />;
}
