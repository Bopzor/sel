import { TransactionStatus } from '@sel/shared';

import { DomainError, EntityNotFound } from '../domain-error';
import { HttpStatus } from '../http-status';

export class TransactionNotFound extends EntityNotFound {
  constructor(transactionId: string) {
    super('Transaction not found', 'transaction', transactionId);
  }
}

export class PayerIsRecipientError extends DomainError<{ payerId: string; recipientId: string }> {
  status = HttpStatus.badRequest;

  constructor(id: string) {
    super('The payer and the recipient cannot be equal', { payerId: id, recipientId: id });
  }
}

export class InvalidTransactionCreatorError extends DomainError<{
  creatorId: string;
  payerId: string;
  recipientId: string;
}> {
  status = HttpStatus.badRequest;

  constructor(creatorId: string, payerId: string, recipientId: string) {
    super('The creator must be either the payer or the recipient', { creatorId, payerId, recipientId });
  }
}

export class NegativeAmountError extends DomainError<{ amount: number }> {
  status = HttpStatus.badRequest;

  constructor(amount: number) {
    super('The amount must be greater than zero', { amount });
  }
}

export class MemberIsNotPayerError extends DomainError<{
  transactionId: string;
  memberId: string;
  payerId: string;
}> {
  status = HttpStatus.forbidden;

  constructor(transactionId: string, memberId: string, payerId: string) {
    super('Member must be the payer to accept or cancel the transaction', {
      transactionId,
      memberId,
      payerId,
    });
  }
}

export class TransactionIsNotPendingError extends DomainError<{
  transactionId: string;
  status: TransactionStatus;
}> {
  status = HttpStatus.badRequest;

  constructor(transactionId: string, status: TransactionStatus) {
    super('Transaction status must be pending', { transactionId, status });
  }
}
