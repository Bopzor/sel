/* @refresh reload */

import 'solid-devtools';

import { render } from 'solid-js/web';

import { App } from './app';

import './index.css';

const root = document.getElementById('root');

render(() => <App />, root as HTMLElement);
