/* @refresh reload */

import 'solid-devtools';

import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import { App } from './app';

import '@fontsource-variable/inter/index.css';

import './index.css';

const root = document.getElementById('root');

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  root as HTMLElement
);
