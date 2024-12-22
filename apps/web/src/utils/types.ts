export type ValueOf<T> = T[keyof T];

export type Get<T, K> =
  T extends Record<string, unknown>
    ? K extends `${infer P}.${infer S}`
      ? Get<Extract<T[P], Record<string, unknown>>, S>
      : K extends keyof T
        ? T[K]
        : never
    : never;

export type Paths<T> = ValueOf<{
  [Key in keyof T as string]: T[Key] extends object
    ? `${Extract<Key, string>}.${Extract<Paths<T[Key]>, string>}`
    : Key;
}>;

export type Flatten<T> = {
  [Key in Extract<Paths<T>, string>]: Get<T, Key>;
};
