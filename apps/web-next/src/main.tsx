import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import './index.css';

function Home() {
  return <h1 className="text-title-1">Hello</h1>;
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
