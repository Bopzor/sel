import { z } from 'zod';

import { localFileUrls, type HttpMethod } from 'src/app/api';

import { demo } from './demo';
import { demoCommentRoutes } from './handlers/comments';
import { demoDocumentRoutes } from './handlers/documents';
import { demoEventRoutes } from './handlers/events';
import { demoFeedRoutes } from './handlers/feed';
import { demoFileRoutes } from './handlers/files';
import { demoInformationRoutes } from './handlers/information';
import { demoInterestRoutes } from './handlers/interests';
import { demoMemberRoutes } from './handlers/members';
import { demoRequestRoutes } from './handlers/requests';
import { demoSessionRoutes } from './handlers/session';
import { demoTransactionRoutes } from './handlers/transactions';
import { loadDemoState, saveDemoState } from './state';
import { demoStorage } from './storage';

// The files referenced by the seed, bundled with the app.
const seedFiles = import.meta.glob<string>('./files/*', { query: '?url', import: 'default', eager: true });

const routes = [
  ...demoSessionRoutes,
  ...demoFileRoutes,
  ...demoCommentRoutes,
  ...demoFeedRoutes,
  ...demoRequestRoutes,
  ...demoEventRoutes,
  ...demoInformationRoutes,
  ...demoInterestRoutes,
  ...demoDocumentRoutes,
  ...demoMemberRoutes,
  ...demoTransactionRoutes,
];

export async function installDemo() {
  const state = await loadDemoState();

  for (const [path, url] of Object.entries(seedFiles)) {
    localFileUrls.set(path.replace('./files/', ''), url);
  }

  for (const { name, blob } of await demoStorage.getFiles()) {
    localFileUrls.set(name, URL.createObjectURL(blob));
  }

  globalThis.fetch = createFetch(state);
}

function createFetch(state: demo.State): typeof fetch {
  const networkFetch = globalThis.fetch;

  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input, window.location.origin);

    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) {
      return networkFetch(input, init);
    }

    const method = (init?.method ?? 'GET') as HttpMethod;
    const pathname = url.pathname.replace(/^\/api/, '');

    for (const { pattern, handler, ...route } of routes) {
      const match = pattern.exec({ pathname });

      if (route.method !== method || !match) {
        continue;
      }

      try {
        const response = await handler({
          state,
          params: match.pathname.groups,
          query: Object.fromEntries(url.searchParams),
          body: typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body,
          member: () => sessionMember(state),
        });

        // Even after a GET: verifying a sign-in code changes the session.
        await saveDemoState(state);

        return response;
      } catch (error) {
        return errorResponse(error);
      }
    }

    return demo.json({ error: `${method} ${pathname} is not available in the demo` }, { status: 404 });
  };
}

function sessionMember(state: demo.State) {
  const member = state.members.find(({ id }) => id === state.sessionMemberId);

  if (!member) {
    throw new demo.Error(401, 'Unauthorized');
  }

  return member;
}

function errorResponse(error: unknown) {
  if (error instanceof demo.Error) {
    return demo.json({ error: error.message, code: error.code }, { status: error.status });
  }

  if (error instanceof z.ZodError) {
    return demo.json({ error: 'Validation error', issues: error.issues }, { status: 400 });
  }

  // oxlint-disable-next-line no-console
  console.error(error);

  return demo.json({ error: 'Internal demo error' }, { status: 500 });
}
