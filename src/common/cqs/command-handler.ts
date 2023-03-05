export interface CommandHandler<Command> {
  handle(command: Command): void | Promise<void>;
}
