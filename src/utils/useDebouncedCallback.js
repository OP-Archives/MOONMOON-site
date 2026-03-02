import { useCallback, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';

export const useDebouncedCallback = (callback, delay) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    debounce((...args) => {
      callbackRef.current(...args);
    }, delay),
    [delay]
  );
};

export const useDebouncedSetter = (setter, delay) => {
  const setterRef = useRef(setter);

  useEffect(() => {
    setterRef.current = setter;
  }, [setter]);

  return useCallback(
    debounce((value) => {
      if (value !== undefined && value !== '' && value !== null) {
        setterRef.current(value);
      }
    }, delay),
    [delay]
  );
};
