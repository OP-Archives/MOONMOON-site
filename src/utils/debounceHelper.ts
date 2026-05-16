import { useRef, useEffect, useLayoutEffect } from 'react';

export const useDebouncedSetter = (setter: (_value: string) => void, delay: number) => {
  const timeoutRef = useRef<number | null>(null);
  const setterRef = useRef(setter);

  useLayoutEffect(() => {
    setterRef.current = setter;
  }, [setter]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (value: string) => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      setterRef.current(value);
    }, delay);
  };
};
