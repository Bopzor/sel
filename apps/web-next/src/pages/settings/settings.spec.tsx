import { screen } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { activateLocale } from 'src/app/locale';
import { routes } from 'src/app/routes';
import { renderTestPage } from 'src/tests/test-page';

import { SettingsPage } from './settings-page';

describe('settings', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    localStorage.clear();
    activateLocale('en');
    delete document.documentElement.dataset.theme;
  });

  it("shows the app's version", async () => {
    renderPage();

    expect(await screen.findByText(`Version ${__APP_VERSION__}`)).toBeInTheDocument();
  });

  it('follows the device appearance by default', async () => {
    renderPage();

    expect(await screen.findByRole('radio', { name: 'Same as the device' })).toBeChecked();
  });

  it('changes the appearance', async () => {
    renderPage();

    await user.click(await screen.findByRole('radio', { name: 'Dark' }));

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('color-scheme')).toEqual('dark');
  });

  it('changes the language', async () => {
    renderPage();

    await user.click(await screen.findByRole('radio', { name: 'Français' }));

    expect(await screen.findByRole('heading', { name: 'Paramètres' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Français' })).toBeChecked();
    expect(document.documentElement).toHaveAttribute('lang', 'fr');
    expect(localStorage.getItem('locale')).toEqual('fr');
  });
});

function renderPage() {
  renderTestPage(routes.settings(), [{ path: routes.settings(), Component: SettingsPage }]);
}
