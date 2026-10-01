import { i18n } from '@lingui/core';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { messages } from './locales/en.po';
import { queryClient } from './query-client';

i18n.loadAndActivate({ locale: 'en', messages });

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});
