import { DomainError, EntityNotFound } from '../domain-error';

export class TransactionNotFound extends EntityNotFound {
  constructor(transactionId: string) {
    super('Transaction not found', 'transaction', transactionId);
  }
}

export class PayerIsRecipientError extends DomainError<{ payerId: string; recipientId: string }> {
  constructor(id: string) {
    super('The payer and the recipient cannot be equal', { payerId: id, recipientId: id });
  }
}

export class InvalidTransactionCreatorError extends DomainError<{
  creatorId: string;
  payerId: string;
  recipientId: string;
}> {
  constructor(creatorId: string, payerId: string, recipientId: string) {
    super('The creator must be either the payer or the recipient', { creatorId, payerId, recipientId });
  }
}

export class NegativeAmountError extends DomainError<{ amount: number }> {
  constructor(amount: number) {
    super('The amount must be greater than zero', { amount });
  }
}
