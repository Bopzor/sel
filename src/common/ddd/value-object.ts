export abstract class ValueObject<Value = unknown> {
  constructor(protected value: Value) {}
}
