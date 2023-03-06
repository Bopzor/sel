type ShowProps<T> = {
  when: T | undefined | false;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element | JSX.Element[]);
};

export const Show = <T,>({ when, fallback, children }: ShowProps<T>) => {
  if (when) {
    if (typeof children === 'function') {
      return <>{children(when)}</>;
    }

    return children;
  }

  return fallback ?? null;
};
