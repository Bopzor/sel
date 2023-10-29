import { Token } from './token.entity';

export interface TokenRepository {
  create(token: Token, memberId: string): Promise<void>;
}
