import { renderToString } from 'solid-js/web';

import { Component } from 'solid-js';
import mjml2html from 'mjml';

import * as test from './emails/test';
import * as authentication from './emails/authentication';
import * as notification from './emails/notification';

export default {
  test: renderer(test),
  authentication: renderer(authentication),
  notification: renderer(notification),
};

type EmailFunctions<Props> = {
  subject: (props: Props) => string;
  html: Component<Props>;
  text: (props: Props) => string;
};

function renderer<Props>({ subject, html, text }: EmailFunctions<Props>) {
  return (props: Props) => ({
    subject: subject(props),
    html: mjml2html(renderToString(() => html(props))).html,
    text: text(props).trim(),
  });
}
