import { useRef } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { ContainerProvider } from '../app/front-tokens';

import { PageContextProvider } from './page-context';
import { PageContext } from './types';

type AppProvidersProps = {
  context: PageContext;
  queryClient?: QueryClient;
  children: React.ReactNode;
};

export const AppProviders = ({ context, queryClient = new QueryClient(), children }: AppProvidersProps) => {
  const queryClientRef = useRef(queryClient);

  return (
    <PageContextProvider context={context}>
      <ContainerProvider>
        <QueryClientProvider client={queryClientRef.current}>
          <ReactQueryDevtools initialIsOpen={false} />
          {children}
        </QueryClientProvider>
      </ContainerProvider>
    </PageContextProvider>
  );
};
