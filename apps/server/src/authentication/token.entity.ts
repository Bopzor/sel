import { createDate, createFactory, createId } from '@sel/utils';

export enum TokenType {
  authentication = 'authentication',
  session = 'session',
}

export type Token = {
  id: string;
  value: string;
  expirationDate: Date;
  type: TokenType;
  memberId: string;
  revoked: boolean;
};

export const createToken = createFactory<Token>(() => ({
  id: createId(),
  value: '',
  expirationDate: createDate(),
  type: TokenType.authentication,
  memberId: '',
  revoked: false,
}));
