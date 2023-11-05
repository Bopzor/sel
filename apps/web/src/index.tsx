/* @refresh reload */

import 'solid-devtools';

import { render } from 'solid-js/web';

import { App } from './app';

import '@fontsource-variable/inter/index.css';

import './index.css';

Error.stackTraceLimit = 1 << 8;

const root = document.getElementById('root');

render(() => <App />, root as HTMLElement);
