import ReactDOM from 'react-dom/client';
import * as yup from 'yup';

import { ApiProvider } from '../app/api.context';

import { apiContext } from './in-memory-api-context';
import { Layout } from './layout/layout';
import { PageContextProvider } from './page-context';
import { PageContextClient } from './types';

import '@fontsource/inter/variable.css';
import '../styles.css';

export const clientRouting = true;
export const hydrationCanBeAborted = true;

yup.setLocale({
  mixed: {
    default: 'default',
    required: 'required',
  },
});

let root: ReactDOM.Root;

export function render(pageContext: PageContextClient) {
  const { Page, pageProps } = pageContext;

  const container = document.getElementById('app') as HTMLElement;

  const page = (
    <PageContextProvider context={pageContext}>
      <ApiProvider value={apiContext}>
        <Layout>
          <Page {...pageProps} />
        </Layout>
      </ApiProvider>
    </PageContextProvider>
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
