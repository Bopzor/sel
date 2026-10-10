import { useEffect, useRef, useState } from 'react';

export function useDebouncedValue(externalValue: string, onDebounced: (value: string) => void, delay = 300) {
  const [value, setValue] = useState(externalValue);
  const [previousExternalValue, setPreviousExternalValue] = useState(externalValue);
  const timeout = useRef<number>(undefined);
  const onDebouncedRef = useRef(onDebounced);

  // The timeout calls the latest callback: an older one can close over a stale state.
  useEffect(() => {
    onDebouncedRef.current = onDebounced;
  });

  if (externalValue !== previousExternalValue) {
    setPreviousExternalValue(externalValue);
    setValue(externalValue);
  }

  // A change from outside (a link, the browser's history) wins over a pending one.
  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, [externalValue]);

  const handleChange = (value: string) => {
    setValue(value);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => onDebouncedRef.current(value), delay);
  };

  const clear = () => {
    clearTimeout(timeout.current);
    setValue('');
  };

  return [value, handleChange, clear] as const;
}
