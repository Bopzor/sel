import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { ContainerProvider } from '../app/container';
import { ContainerProvider as ContainerProvider2 } from '../app/front-tokens';

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
      <ContainerProvider2>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          {children}
        </QueryClientProvider>
      </ContainerProvider2>
    </ContainerProvider>
  </PageContextProvider>
);
