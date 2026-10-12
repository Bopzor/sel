import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routes } from 'src/app/routes';
import { renderTest } from 'src/tests/test-page';

import { FeedbackCard } from './feedback-card';

describe('feedback card', () => {
  it('offers to report a bug, to suggest a change and to get help', () => {
    renderTest(
      <MemoryRouter>
        <FeedbackCard />
      </MemoryRouter>,
    );

    for (const name of ['Report a bug', 'Suggest a change', 'Get help']) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', routes.feedback());
    }
  });
});
