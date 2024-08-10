import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisher } from '../../infrastructure/events/event-publisher';
import { Database } from '../../persistence/database';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import {
  InvalidTransactionCreatorError,
  NegativeAmountError,
  PayerIsRecipientError,
} from '../transaction-errors';
import { TransactionCreated } from '../transaction-events';

export type CreateTransactionCommand = {
  transactionId: string;
  payerId: string;
  recipientId: string;
  creatorId: string;
  amount: number;
  description: string;
};

export class CreateTransaction implements CommandHandler<CreateTransactionCommand> {
  static inject = injectableClass(
    this,
    TOKENS.date,
    TOKENS.database,
    TOKENS.eventPublisher,
    TOKENS.memberRepository,
  );

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
    private readonly eventPublisher: EventPublisher,
    private readonly memberRepository: MemberRepository,
  ) {}

  async handle(command: CreateTransactionCommand): Promise<void> {
    const { transactionId, payerId, recipientId, creatorId, amount, description } = command;
    const now = this.dateAdapter.now();

    if (payerId === recipientId) {
      throw new PayerIsRecipientError(payerId);
    }

    if (creatorId !== payerId && creatorId !== recipientId) {
      throw new InvalidTransactionCreatorError(creatorId, payerId, recipientId);
    }

    if (amount <= 0) {
      throw new NegativeAmountError(amount);
    }

    const payer = await this.memberRepository.getMemberOrFail(payerId);
    const recipient = await this.memberRepository.getMemberOrFail(recipientId);
    const creator = creatorId === payerId ? payer : recipient;

    await this.database.db.insert(schema.transactions).values({
      id: transactionId,
      status: 'pending',
      description,
      amount,
      payerId: payer.id,
      recipientId: recipient.id,
      creatorId: creator.id,
      createdAt: now,
      updatedAt: now,
    });

    this.eventPublisher.publish(new TransactionCreated(transactionId));
  }
}
