import { demo } from '../demo';

// The urls of the documents are the names of seed files, bundled with the app.
export const demoDocumentRoutes = [
  demo.route('GET', '/documents', ({ state }) => demo.json(state.documents)),
];
