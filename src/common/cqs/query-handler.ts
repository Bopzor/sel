export interface QueryHandler<Query extends object, Result> {
  handle(query: Query): Result | Promise<Result>;
}
