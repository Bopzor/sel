/* @refresh reload */

import 'solid-devtools';

import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import { App } from './app';
import { TranslationsProvider } from './intl';

import '@fontsource-variable/inter/index.css';

import './index.css';

const root = document.getElementById('root');

render(
  () => (
    <TranslationsProvider>
      <Router>
        <App />
      </Router>
    </TranslationsProvider>
  ),
  root as HTMLElement
);
