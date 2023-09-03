import express from 'express';

import { container } from './container.js';
import { TOKENS } from './tokens.js';

const app = express();

app.use('/members', container.resolve(TOKENS.membersController).router);

app.listen(process.env.PORT, () => {
  console.log('server started');
});
