/// <reference types="vite/client" />

import 'dotenv/config';

import { initialize } from './initialize';
import { server } from './server';

initialize();
server().listen(3000);
