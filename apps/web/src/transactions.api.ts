import { CreateTransactionBody } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from './infrastructure/fetcher';
import { TOKENS } from './tokens';

export interface TransactionsApi {
  createTransaction(body: CreateTransactionBody): Promise<string>;
}

export class FetchTransactionApi implements TransactionsApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async createTransaction(body: CreateTransactionBody): Promise<string> {
    const transactionId = await this.fetcher
      .post<CreateTransactionBody, string>('/api/transactions', body)
      .body();

    return transactionId;
  }
}

export class StubTransactionsApi implements TransactionsApi {
  async createTransaction(): Promise<string> {
    return '';
  }
}
