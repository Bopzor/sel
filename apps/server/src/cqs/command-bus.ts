import { EventBus } from './event-bus';
import { Handlers } from './handlers';
import { Token } from './token';

type PublishEvent = (event: object) => void;

export interface UnitOfWork<Tx> {
  <Result>(cb: (transaction: Tx) => Promise<Result>): Promise<Result>;
}

export type CommandContext<Tx> = {
  transaction: Tx;
  publish: PublishEvent;
};

type CommandToken<Tx, Params extends unknown[]> = Token<
  [CommandContext<Tx>, ...Params],
  void | Promise<void>
>;

export type CommandHandler<Tx, Params extends unknown[]> = (
  ctx: CommandContext<Tx>,
  ...params: Params
) => Promise<void>;

export class CommandBus<Tx> {
  private handlers = new Handlers();

  constructor(private eventBus: EventBus, private unitOfWork: UnitOfWork<Tx>) {}

  register<Params extends unknown[]>(
    token: CommandToken<Tx, Params>,
    handler: CommandHandler<Tx, Params>
  ): void {
    this.handlers.register(token, handler);
  }

  async execute<Params extends unknown[]>(token: CommandToken<Tx, Params>, ...params: Params): Promise<void> {
    const publisher = this.eventBus.publisher();
    const publish = publisher.prepare.bind(publisher);

    await this.unitOfWork(async (transaction) => {
      const ctx: CommandContext<Tx> = {
        transaction,
        publish,
      };

      return this.handlers.execute(token, ctx, ...params);
    });

    publisher.commit();
  }
}
