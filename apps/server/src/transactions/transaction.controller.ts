import * as shared from '@sel/shared';
import { pick } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';
import { RequestHandler, Router } from 'express';

import { SessionProvider } from '../authentication/session.provider';
import { HttpStatus } from '../http-status';
import { CommandBus } from '../infrastructure/cqs/command-bus';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { Database } from '../persistence/database';
import { transactions } from '../persistence/schema';
import { COMMANDS, TOKENS } from '../tokens';

import { TransactionNotFound } from './transaction-errors';

export class TransactionController {
  readonly router = Router();

  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.sessionProvider,
    TOKENS.database,
    TOKENS.commandBus,
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly sessionProvider: SessionProvider,
    private readonly database: Database,
    private readonly commandBus: CommandBus,
  ) {
    this.router.use(this.authenticated);

    this.router.get('/:transactionId', this.getTransaction);
    this.router.post('/', this.createTransaction);
    this.router.put('/:transactionId/accept', this.acceptTransaction);
    this.router.put('/:transactionId/cancel', this.cancelTransaction);
  }

  authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  getTransaction: RequestHandler<{ transactionId: string }, shared.Transaction> = async (req, res) => {
    const { transactionId } = req.params;

    const transaction = await this.database.db.query.transactions.findFirst({
      where: eq(transactions.id, transactionId),
      with: {
        payer: true,
        recipient: true,
      },
    });

    if (!transaction) {
      throw new TransactionNotFound(transactionId);
    }

    res.send({
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      description: transaction.description,
      payer: pick(transaction.payer, ['id', 'firstName', 'lastName']),
      recipient: pick(transaction.recipient, ['id', 'firstName', 'lastName']),
      date: transaction.createdAt.toISOString(),
    });
  };

  createTransaction: RequestHandler<never, string, shared.CreateTransactionBody> = async (req, res) => {
    const transactionId = this.generator.id();
    const member = this.sessionProvider.getMember();
    const body = shared.createTransactionBodySchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.createTransaction, {
      transactionId,
      description: body.description,
      amount: body.amount,
      payerId: body.payerId,
      recipientId: body.recipientId,
      creatorId: member.id,
    });

    res.status(HttpStatus.created).send(transactionId);
  };

  acceptTransaction: RequestHandler<{ transactionId: string }> = async (req, res) => {
    const { transactionId } = req.params;
    const member = this.sessionProvider.getMember();

    await this.commandBus.executeCommand(COMMANDS.acceptTransaction, {
      transactionId,
      memberId: member.id,
    });

    res.end();
  };

  cancelTransaction: RequestHandler<{ transactionId: string }> = async (req, res) => {
    const { transactionId } = req.params;
    const member = this.sessionProvider.getMember();

    await this.commandBus.executeCommand(COMMANDS.cancelTransaction, {
      transactionId,
      memberId: member.id,
    });

    res.end();
  };
}
