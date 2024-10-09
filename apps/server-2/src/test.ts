import { RequestHandler } from 'express';

import { db } from './persistence/database';
import { members } from './persistence/schema';

export const test: RequestHandler = async (req, res) => {
  res.json(await db.select().from(members));
};
