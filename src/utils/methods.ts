export type Methods<Service> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [Key in keyof Service]: Service[Key] extends (...args: any[]) => any ? Service[Key] : never;
};
