import { lazy, Suspense, useEffect, useState } from 'react';

import { FallbackSpinner } from './fallback';

type ClientOnlyProps<Props> = Props & {
  load: () => Promise<{ default: React.ComponentType<Props> }>;
};

export const ClientOnly = <Props,>({ load, ...props }: ClientOnlyProps<Props>) => {
  const [Component, setComponent] = useState<React.ComponentType<any>>(
    // eslint-disable-next-line react/display-name
    () => () => <FallbackSpinner />
  );

  useEffect(() => {
    setComponent(() => lazy(load));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<FallbackSpinner />}>
      <Component {...props} />
    </Suspense>
  );
};
