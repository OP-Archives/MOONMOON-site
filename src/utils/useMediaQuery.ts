import { useSyncExternalStore, useMemo, useCallback } from 'react';

export function useMediaQuery(query: string) {
  const mediaQuery = useMemo(() => window.matchMedia(query), [query]);

  const subscribe = useCallback(
    (callback: (_e: MediaQueryListEvent) => void) => {
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    [mediaQuery]
  );

  const getSnapshot = useCallback(() => mediaQuery.matches, [mediaQuery]);

  return useSyncExternalStore(subscribe, getSnapshot);
}
