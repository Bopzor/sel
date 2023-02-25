export interface CommandHandler<Command extends object> {
  handle(command: Command): void | Promise<void>;
}
