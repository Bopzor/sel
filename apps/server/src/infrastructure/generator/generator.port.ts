export interface GeneratorPort {
  id(): string;
  token(length: number): string;
}
