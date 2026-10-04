export type LinkComponent = 'a' | React.ComponentType<React.ComponentProps<'a'>>;

export function definedAttributes<T extends Record<string, unknown>>(props: T): Partial<T> {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as Partial<T>;
}
