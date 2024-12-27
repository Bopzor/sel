import { db, schema } from 'src/persistence';

import { FileInsert } from './file.entity';

export async function insertFile(values: FileInsert) {
  await db.insert(schema.files).values(values);
}
