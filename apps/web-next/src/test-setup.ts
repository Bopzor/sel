import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { queryClient } from './query-client';

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});
