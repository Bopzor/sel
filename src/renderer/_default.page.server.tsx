import ReactDOMServer from 'react-dom/server';
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr';

import { AppProviders } from './app-providers';
import { Layout } from './layout/layout';
import type { PageContextServer } from './types';

import './initial-data';

export const passToClient = ['pageProps', 'routeParams'];

export function render(pageContext: PageContextServer) {
  const { Page, pageProps } = pageContext;

  const html = ReactDOMServer.renderToString(
    <Document>
      <AppProviders context={pageContext}>
        <Layout>
          <Page {...pageProps} />
        </Layout>
      </AppProviders>
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
