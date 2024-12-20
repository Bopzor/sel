import { DomainError } from './domain-error';

export enum HttpStatus {
  ok = 200,
  created = 201,
  noContent = 204,
  permanentRedirect = 308,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  internalServerError = 500,
}

export class BadRequest extends DomainError {
  public status = HttpStatus.badRequest;
}

export class Unauthorized extends DomainError {
  public status = HttpStatus.unauthorized;
}

export class Forbidden extends DomainError {
  public status = HttpStatus.forbidden;
}

export class NotFound extends DomainError {
  public status = HttpStatus.notFound;
}
