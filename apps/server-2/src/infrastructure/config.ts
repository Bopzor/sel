import { defined } from '@sel/utils';

export const config = {
  database: {
    url: defined(process.env.DATABASE_URL),
  },
};
