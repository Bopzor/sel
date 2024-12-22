export function wait(ms: number, abort?: AbortSignal) {
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => resolve(true), ms);

    if (abort) {
      abort.addEventListener('abort', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    }
  });
}

export const waitFor = async <T>(callback: () => T | Promise<T>): Promise<T> => {
  let error: unknown;
  const start = Date.now();

  do {
    try {
      return await callback();
    } catch (err) {
      error = err;
    }

    await wait(10);
  } while (error && Date.now() - start < 1000);

  throw error;
};
