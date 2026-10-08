import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);

      list.addEventListener('change', onChange);

      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  const getState = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getState);
}
