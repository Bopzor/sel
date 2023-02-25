type ForProps<Item> = {
  each?: Item[];
  fallback: JSX.Element;
  children: (item: Item, index: number) => React.ReactNode;
};

export const For = <Item,>({ each, fallback, children }: ForProps<Item>) => {
  if (!each) {
    return fallback;
  }

  return <>{each.map(children)}</>;
};
