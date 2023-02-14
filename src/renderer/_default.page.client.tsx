import ReactDOM from 'react-dom/client';

import { PageContextProvider } from './page-context';
import { PageContextClient } from './types';

import '../styles.css';

export const clientRouting = true;
export const hydrationCanBeAborted = true;

let root: ReactDOM.Root;

export function render(pageContext: PageContextClient) {
  const { Page, pageProps } = pageContext;

  const container = document.getElementById('app') as HTMLElement;

  const page = (
    <PageContextProvider context={pageContext}>
      <Page {...pageProps} />
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
