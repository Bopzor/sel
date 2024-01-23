import { container } from '../container';
import { TOKENS } from '../tokens';

// eslint-disable-next-line no-console
main().catch(console.error);

async function main() {
  const database = container.resolve(TOKENS.database);

  try {
    await database.migrate();
  } finally {
    await database.close();
  }
}
