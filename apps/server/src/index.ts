import express from 'express';

import { container } from './container.js';
import { TOKENS } from './tokens.js';

import './fake-data';

const config = container.resolve(TOKENS.config);
const app = express();

app.use('/members', container.resolve(TOKENS.membersController).router);

const host = config.server.host;
const port = config.server.port;

app.listen(port, () => {
  console.log(`server listening on ${host}:${port}`);
});
