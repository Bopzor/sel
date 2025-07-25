/* @refresh reload */
import './application/sentry';
import './application/side-effects';

import { render } from 'solid-js/web';

// @ts-expect-error font import
import '@fontsource-variable/inter';
import './index.css';

import { App } from './app';

render(() => <App />, document.getElementById('root') as HTMLElement);

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js');
}
