import { useCallback, useRef } from 'react';

export const useDebouncedCallback = (callback, delay) => {
  const timeoutIdRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

export const useDebouncedSetter = (setter, delay) => {
  const timeoutIdRef = useRef(null);

  return useCallback((value) => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      if (value !== undefined && value !== '' && value !== null) {
        setter(value);
      }
    }, delay);
  }, [setter, delay]);
};