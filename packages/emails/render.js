import fs from 'node:fs/promises';

import emails from './dist/index.js';

function output({ subject, text, html }) {
  const iframeHtml = html.replaceAll('"', '&quot;');

  return [
    //
    `<h1>${subject}</h1>`,
    `<pre style="background: #EEE; padding: 8px; white-space: pre-wrap">${text}</pre>`,
    `<iframe seamless sandbox width="640" height="600" style="resize: both" srcdoc="${iframeHtml}" />`,
  ].join('\n\n');
}

const appBaseUrl = 'http://localhost:8000';
const firstName = 'Baptiste';

const variables = {
  test: {
    appBaseUrl,
    variable: 'value',
  },

  authentication: {
    appBaseUrl,
    firstName,
    authenticationUrl: appBaseUrl + '?auth-token=token',
  },

  newAppVersion: {
    appBaseUrl,
    firstName,
  },

  requestCreated: {
    appBaseUrl,
    firstName,
    request: {
      id: 'requestId',
      title: 'Accorder un piano',
      requester: {
        id: 'requesterId',
        firstName: 'Maxence',
        lastName: 'Duparc',
      },
      body: "Bonjour,\n\nJ'ai récupéré un vieux piano qui sonne faux, est-ce que quelqu'un saurait l'accorder ?",
    },
  },

  requestCommentCreated: {
    appBaseUrl,
    firstName,
    request: {
      id: 'requestId',
      title: 'Accorder un piano',
      requester: {
        id: 'requesterId',
        firstName: 'Maxence',
        lastName: 'Duparc',
      },
    },
    comment: {
      id: 'commentId',
      message:
        "J'ai un ami qui est prof de musique, il pourra probablement t'aider. Est-ce que tu veux que je lui demande ?",
      author: {
        id: 'authorId',
        firstName: 'Thibault',
        lastName: 'Bonnet',
      },
    },
  },

  requestStatusChanged: {
    appBaseUrl,
    firstName,
    request: {
      id: 'requestId',
      title: 'Accorder un piano',
      status: 'canceled',
      requester: {
        id: 'requesterId',
        firstName: 'Maxence',
        lastName: 'Duparc',
      },
    },
  },
};

await fs.mkdir('outputs', { recursive: true });

for (const [name, props] of Object.entries(variables)) {
  await fs.writeFile(`outputs/${name}.html`, output(emails[name](props)));
}
