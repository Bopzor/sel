import { JSX } from 'solid-js';

import { Body } from './body';
import { Head } from './head';

type EmailProps = {
  appBaseUrl: string;
  preview: string;
  children: JSX.Element;
};

export function Email(props: EmailProps) {
  return (
    <mjml>
      <Head preview={props.preview} />
      <Body appBaseUrl={props.appBaseUrl}>{props.children}</Body>
    </mjml>
  );
}
