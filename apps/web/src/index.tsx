/* @refresh reload */
import '@fontsource-variable/inter';
import '@fontsource-variable/nunito';
import '@fontsource-variable/playpen-sans';
import { ErrorBoundary } from 'solid-js';
import { render } from 'solid-js/web';

import './application/side-effects';
import { App } from './app';
import { ErrorFallback } from './components/error-boundary';
import './index.css';

render(
  () => (
    <ErrorBoundary fallback={(error) => <ErrorFallback report error={error} />}>
      <App />
    </ErrorBoundary>
  ),
  document.getElementById('root') as HTMLElement,
);

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js');
}
