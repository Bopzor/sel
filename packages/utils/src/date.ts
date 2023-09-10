export function createDate(date?: string) {
  return new Date(date ?? Date.now());
}
