export class AuthorizationError extends Error {
  constructor() {
    super('Unauthorized');
  }
}
