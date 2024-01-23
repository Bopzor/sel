import fs from 'fs';

import { container } from '../container';
import { TOKENS } from '../tokens';

import { members, requests } from './schema';

const tables = {
  members,
  requests,
};

const table = tables[process.argv[2] as keyof typeof tables];
const filename = process.argv[3];

const generator = container.resolve(TOKENS.generator);
const dateAdapter = container.resolve(TOKENS.date);
const database = container.resolve(TOKENS.database);

const now = dateAdapter.now();
const entries = JSON.parse(String(fs.readFileSync(filename)));

for (const entry of entries) {
  for (const [key, value] of Object.entries(entry)) {
    if (key === 'date') {
      entry[key] = new Date(value as string);
    }
  }

  await database.db.insert(table).values({
    id: generator.id(),
    createdAt: now,
    updatedAt: now,
    ...entry,
  });
}

await database.close();
