import { DehydratedState, QueryClient } from 'react-query';
import type { PageContextBuiltIn } from 'vite-plugin-ssr';
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router';

import { FRONT_TOKENS } from '../app/front-tokens';
import type { PrefetchQuery } from '../app/prefetch-query';

type Page = (pageProps: PageProps) => React.ReactElement;
type PageProps = object;

type PageContextCustom = {
  Page: Page;
  pageProps?: PageProps;
  routeParams: Record<string, string>;
};

type ServerContext = {
  FRONT_TOKENS: typeof FRONT_TOKENS;
  queryClient: QueryClient;
  prefetchQuery: PrefetchQuery;
};

type ClientContext = {
  dehydratedState: DehydratedState;
};

export type PageContextServer = PageContextBuiltIn<Page> & PageContextCustom & ServerContext;
export type PageContextClient = PageContextBuiltInClient<Page> & PageContextCustom & ClientContext;

export type PageContext = PageContextClient | PageContextServer;
