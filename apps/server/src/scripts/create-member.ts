import { Application } from '../application';
import { container } from '../container';
import { TOKENS } from '../tokens';

const app = container.resolve(TOKENS.application);
const logger = container.resolve(TOKENS.logger);

main(app, process.argv.slice(2))
  .catch((error) => logger.error(error))
  .finally(() => void app.close());

async function main(app: Application, args: string[]) {
  const email = args[0];
  const generator = container.resolve(TOKENS.generator);

  await app.createMember({
    memberId: generator.id(),
    firstName: '',
    lastName: '',
    email,
  });
}
