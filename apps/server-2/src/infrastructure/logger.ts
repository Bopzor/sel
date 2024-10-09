import { pick } from '@sel/utils';

export const logger = pick(console, ['log', 'warn', 'error']);
