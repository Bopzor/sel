import ReactDOMServer from 'react-dom/server';
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr';

import { ApiProvider } from '../app/api.context';

import { apiContext } from './in-memory-api-context';
import { Layout } from './layout/layout';
import { PageContextProvider } from './page-context';
import type { PageContextServer } from './types';

export const passToClient = ['pageProps', 'routeParams'];

export function render(pageContext: PageContextServer) {
  const { Page, pageProps } = pageContext;

  const html = ReactDOMServer.renderToString(
    <Document>
      <PageContextProvider context={pageContext}>
        <ApiProvider value={apiContext}>
          <Layout>
            <Page {...pageProps} />
          </Layout>
        </ApiProvider>
      </PageContextProvider>
    </Document>
  );

  const documentHtml = escapeInject`<!DOCTYPE html>${dangerouslySkipEscape(html)}`;

  return {
    documentHtml,
  };
}

type DocumentProps = {
  title?: string;
  children: React.ReactNode;
};

const Document = ({ title, children }: DocumentProps) => (
  <html lang="fr">
    <Head title={title} />
    <Body>{children}</Body>
  </html>
);

type HeadProps = {
  title?: string;
};

const Head = ({ title }: HeadProps) => (
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
);

type BodyProps = {
  children: React.ReactNode;
};

const Body = ({ children }: BodyProps) => (
  <body>
    <div id="app">{children}</div>
  </body>
);
