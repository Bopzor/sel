export enum TokenType {
  authentication = 'authentication',
  session = 'session',
}

export type Token = {
  id: string;
  value: string;
  expirationDate: Date;
  type: TokenType;
};
