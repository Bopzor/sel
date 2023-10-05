import { container } from '../../container';
import { TOKENS } from '../../tokens';

const database = container.resolve(TOKENS.database);

await database.migrate();
await database.close();
