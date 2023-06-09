import ReactDOMServer from 'react-dom/server';
import { dehydrate, Hydrate } from 'react-query';
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr';

import { FRONT_TOKENS } from '../app/front-tokens';
import { createPrefetchQuery } from '../app/prefetch-query';

import { AppProviders } from './app-providers';
import { Layout } from './layout/layout';
import type { PageContextServer } from './types';

export const passToClient = ['pageProps', 'routeParams', 'dehydratedState'];

export async function render(pageContext: PageContextServer) {
  const { Page, pageProps, queryClient } = pageContext;
  const prefetch = createPrefetchQuery(pageContext);

  await prefetch(FRONT_TOKENS.authenticationService, 'getAuthenticatedMember');

  const dehydratedState = dehydrate(queryClient);

  const html = ReactDOMServer.renderToString(
    <Document>
      <AppProviders context={pageContext}>
        <Hydrate state={dehydratedState}>
          <Layout>
            <Page {...pageProps} />
          </Layout>
        </Hydrate>
      </AppProviders>
    </Document>
  );

  const documentHtml = escapeInject`<!DOCTYPE html>${dangerouslySkipEscape(html)}`;

  return {
    documentHtml,
    pageContext: {
      dehydratedState,
    },
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
