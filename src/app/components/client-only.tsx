import { Suspense, useState, useEffect, lazy } from 'react';

type ClientOnlyProps = {
  load: () => Promise<{ default: React.ComponentType<any> }>;
  props?: any;
  fallback: React.ReactNode;
};

export const ClientOnly = ({ load, props, fallback }: ClientOnlyProps) => {
  // eslint-disable-next-line react/display-name
  const [Component, setComponent] = useState<React.ComponentType>(() => () => <>{fallback}</>);

  useEffect(() => {
    setComponent(() => lazy(load));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};
