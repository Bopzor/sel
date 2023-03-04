export interface QueryHandler<Query extends object, Result> {
  handle(query: Query): Promise<Result>;
}
