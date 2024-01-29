import { renderToString } from 'solid-js/web';

import { Component } from 'solid-js';
import mjml2html from 'mjml';

import * as authentication from './emails/authentication';
import * as notification from './emails/notification';
import * as requestCommentCreated from './emails/request-comment-created';
import * as test from './emails/test';

export default {
  authentication: renderer(authentication),
  notification: renderer(notification),
  requestCommentCreated: renderer(requestCommentCreated),
  test: renderer(test),
};

type EmailFunctions<Props> = {
  subject: (props: Props) => string;
  html: Component<Props>;
  text: (props: Props) => string;
};

function renderer<Props>({ subject, html, text }: EmailFunctions<Props>) {
  return (props: Props) => ({
    subject: `SEL'ons-nous - ${subject(props)}`,
    html: mjml2html(renderToString(() => html(props))).html,
    text: text(props).trim(),
  });
}
