import { i18n } from '@lingui/core';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { queryClient } from 'src/app/query-client';
import { messages } from 'src/locales/en.po';

i18n.loadAndActivate({ locale: 'en', messages });

// A failing request is not retried, for the tests not to wait for the retries.
queryClient.setDefaultOptions({
  ...queryClient.getDefaultOptions(),
  queries: { ...queryClient.getDefaultOptions().queries, retry: false },
});

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});
