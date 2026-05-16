import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string) {
  const mediaQuery = (() => window.matchMedia(query))();

  const subscribe = (callback: (_e: MediaQueryListEvent) => void) => {
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  };

  const getSnapshot = () => mediaQuery.matches;

  return useSyncExternalStore(subscribe, getSnapshot);
}
