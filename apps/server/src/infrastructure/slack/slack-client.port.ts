export interface SlackClientPort {
  send(message: string): Promise<void>;
}
