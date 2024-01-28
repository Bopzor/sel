import { JSX } from 'solid-js';

import { Header } from './header';
import { Section } from './section';

type BodyProps = {
  appBaseUrl: string;
  children: JSX.Element;
};

export function Body(props: BodyProps) {
  return (
    <mj-body background-color="white">
      <Header appBaseUrl={props.appBaseUrl} />

      {props.children}

      <Section padding="30px 0">
        <mj-divider border-color="#005f7e"></mj-divider>
      </Section>
    </mj-body>
  );
}
