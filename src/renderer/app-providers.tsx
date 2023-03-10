import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { ContainerProvider } from '../app/front-tokens';

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
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
      </QueryClientProvider>
    </ContainerProvider>
  </PageContextProvider>
);
