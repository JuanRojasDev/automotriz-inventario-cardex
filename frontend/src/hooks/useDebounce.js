import { useState, useEffect } from 'react';

/**
 * Retarda la actualización de un valor hasta que el usuario deje de escribir.
 * @param {*} value - Valor a debounce
 * @param {number} delay - Milisegundos de espera (default: 400)
 */
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
