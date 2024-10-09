import 'dotenv/config';
import express from 'express';

import { test } from './test';

const app = express();

app.get('/', test);

app.listen(3000);
