import { screen, render } from '@testing-library/react';

import { Page } from './index.page';

describe('Home page', () => {
  it('renders the home page', () => {
    render(<Page />);
    expect(screen.getByText('Hello world!')).toBeVisible();
  });
});
