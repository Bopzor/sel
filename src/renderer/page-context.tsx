import React, { useContext } from 'react';

import { PageContextClient } from './types';

type PageContext = Pick<PageContextClient, 'urlPathname' | 'routeParams'>;

const pageContext = React.createContext<PageContext>({} as PageContextClient);

type PageContextProviderProps = {
  context: PageContext;
  children: React.ReactNode;
};

export const PageContextProvider = ({ context, children }: PageContextProviderProps) => (
  <pageContext.Provider value={context}>{children}</pageContext.Provider>
);

const usePageContext = () => {
  return useContext(pageContext);
};

export const usePathname = () => {
  return usePageContext().urlPathname;
};

const useRouteParams = () => {
  return usePageContext().routeParams;
};

export const useRouteParam = (param: string) => {
  return useRouteParams()[param];
};
