/**
 * The props of Base, with those of Props replacing them: Override<ComponentProps<'input'>, { value?: string }>. A prop
 * of Base that the component does not accept is declared as never in Props ({ children?: never }).
 */
export type Override<Base, Props> = Omit<Base, keyof Props> & Props;

export type LinkComponent = 'a' | React.ComponentType<React.ComponentProps<'a'>>;

export function definedAttributes<T extends Record<string, unknown>>(props: T): Partial<T> {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as Partial<T>;
}
