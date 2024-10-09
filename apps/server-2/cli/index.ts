import { container } from 'src/infrastructure/container';
import { db } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { sendPush } from './commands/send-push';
import { CliCommand } from './types';
import { sendEmail } from './commands/send-email';

const commands: Record<string, CliCommand> = {
  'send-push': sendPush,
  'send-email': sendEmail,
};

main();

export async function main() {
  const logger = container.resolve(TOKENS.logger);
  const [command, ...args] = process.argv.slice(2);

  const error = (message: string) => {
    logger.error(message);
    process.exit(1);
  };

  if (command === undefined) {
    error(`Usage: cli <command> [args...]`);
  }

  if (!(command in commands)) {
    error(`Unknown command "${command}"`);
  }

  const fn = commands[command];

  try {
    await fn(args);
  } catch (error) {
    logger.error(error);
    process.exitCode = 1;
  } finally {
    await db.$client.end();
  }
}
