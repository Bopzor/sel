import ReactDOM from 'react-dom/client';
import { Hydrate } from 'react-query';

import { AppProviders } from './app-providers';
import { Layout } from './layout/layout';
import { PageContextClient } from './types';

import '@fontsource/inter/variable.css';
import '../styles.css';

export const clientRouting = true;
export const hydrationCanBeAborted = true;

let root: ReactDOM.Root;

export function render(pageContext: PageContextClient) {
  const { Page, pageProps, dehydratedState } = pageContext;

  const container = document.getElementById('app') as HTMLElement;

  const page = (
    <AppProviders context={pageContext}>
      <Hydrate state={dehydratedState}>
        <Layout>
          <Page {...pageProps} />
        </Layout>
      </Hydrate>
    </AppProviders>
  );

  if (pageContext.isHydration) {
    root = ReactDOM.hydrateRoot(container, page);
  } else {
    if (!root) {
      root = ReactDOM.createRoot(container);
    }

    root.render(page);
  }
}
