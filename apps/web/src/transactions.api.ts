import { CreateTransactionBody, Transaction } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from './infrastructure/fetcher';
import { TOKENS } from './tokens';

export interface TransactionsApi {
  listTransactions(memberId?: string): Promise<Transaction[]>;
  createTransaction(body: CreateTransactionBody): Promise<string>;
  acceptTransaction(transactionId: string): Promise<void>;
  cancelTransaction(transactionId: string): Promise<void>;
}

export class FetchTransactionApi implements TransactionsApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async listTransactions(memberId?: string): Promise<Transaction[]> {
    const params = new URLSearchParams();

    if (memberId) {
      params.set('memberId', memberId);
    }

    return this.fetcher.get<Transaction[]>(`/api/transactions?${params.toString()}`).body();
  }

  async createTransaction(body: CreateTransactionBody): Promise<string> {
    const transactionId = await this.fetcher
      .post<CreateTransactionBody, string>('/api/transactions', body)
      .body();

    return transactionId;
  }

  async acceptTransaction(transactionId: string): Promise<void> {
    await this.fetcher.put(`/api/transactions/${transactionId}/accept`);
  }

  async cancelTransaction(transactionId: string): Promise<void> {
    await this.fetcher.put(`/api/transactions/${transactionId}/cancel`);
  }
}

export class StubTransactionsApi implements TransactionsApi {
  async listTransactions(): Promise<Transaction[]> {
    return {} as never;
  }

  async createTransaction(): Promise<string> {
    return '';
  }

  async acceptTransaction(): Promise<void> {}

  async cancelTransaction(): Promise<void> {}
}
