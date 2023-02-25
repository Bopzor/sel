export abstract class Entity<Props = unknown> {
  constructor(protected props: Props) {}

  public abstract readonly id: string;
}
