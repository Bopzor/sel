import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { ApiProvider } from '../app/api.context';
import { ContainerProvider } from '../app/container';

import { apiContext } from './in-memory-api-context';
import { PageContextProvider } from './page-context';
import { PageContext } from './types';

const queryClient = new QueryClient();

type AppProvidersProps = {
  context: PageContext;
  children: React.ReactNode;
};

export const AppProviders = ({ context, children }: AppProvidersProps) => (
  <PageContextProvider context={context}>
    <ContainerProvider>
      <ApiProvider value={apiContext}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          {children}
        </QueryClientProvider>
      </ApiProvider>
    </ContainerProvider>
  </PageContextProvider>
);
