import fs from 'fs';

import { container } from '../../container';
import { TOKENS } from '../../tokens';
import { NanoIdGenerator } from '../generator/nanoid-generator.adapter';

import { members } from './schema';

const tables = {
  members,
};

const table = tables[process.argv[2] as keyof typeof tables];
const filename = process.argv[3];

const database = container.resolve(TOKENS.database);
const entries = JSON.parse(String(fs.readFileSync(filename)));
const generator = new NanoIdGenerator();

for (const entry of entries) {
  await database.db.insert(table).values({ id: generator.id(), ...entry });
}

await database.close();
