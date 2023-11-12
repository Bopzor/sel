// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType<T, CtorParams extends any[] = any[]> = {
  new (...params: CtorParams): T;
};
