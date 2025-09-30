export function debounce<Args extends unknown[]>(callback: (...args: Args) => void, wait = 500) {
  let timeoutId: NodeJS.Timeout;

  const clear = () => clearTimeout(timeoutId);

  return {
    debounced: (...args: Args) => {
      if (timeoutId !== undefined) {
        clear();
      }
      timeoutId = setTimeout(() => callback(...args), wait);
    },
    clear,
  };
}
