export const wait = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};

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
