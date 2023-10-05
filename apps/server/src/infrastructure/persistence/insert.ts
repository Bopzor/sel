import fs from 'fs';

import { customAlphabet } from 'nanoid';

import { container } from '../../container';
import { TOKENS } from '../../tokens';

import { members } from './schema';

const tables = {
  members,
};

const table = tables[process.argv[2] as keyof typeof tables];
const filename = process.argv[3];

const database = container.resolve(TOKENS.database);
const entries = JSON.parse(String(fs.readFileSync(filename)));
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

for (const entry of entries) {
  await database.db.insert(table).values({ id: nanoid(), ...entry });
}

await database.close();
