/* @refresh reload */
import './application/side-effects';

import { render } from 'solid-js/web';

// @ts-expect-error font import
import '@fontsource-variable/inter';
// @ts-expect-error font import
import '@fontsource-variable/nunito';
// @ts-expect-error font import
import '@fontsource-variable/playpen-sans';
import './index.css';

import { App } from './app';

render(() => <App />, document.getElementById('root') as HTMLElement);

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js');
}
