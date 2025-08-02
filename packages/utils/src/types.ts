export type IfNever<T, Then, Else> = [T] extends [never] ? Then : Else;

export type OmitNever<T> = Pick<T, { [K in keyof T]: IfNever<T[K], never, K> }[keyof T]>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType<T, CtorParams extends any[] = any[]> = {
  new (...params: CtorParams): T;
};

export type Extend<A, B> = Omit<A, keyof B> & B;
