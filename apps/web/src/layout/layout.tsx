import { Component, JSX } from 'solid-js';

import { Header } from './header/header';

type LayoutProps = {
  children: JSX.Element;
};

export const Layout: Component<LayoutProps> = (props) => {
  return (
    <>
      <Header />
      <main class="col mx-auto w-full max-w-[1300px] flex-1 px-4 pb-4">{props.children}</main>
    </>
  );
};
