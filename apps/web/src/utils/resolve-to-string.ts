export function resolveToString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'function') {
    return resolveToString(value());
  }

  if (Array.isArray(value)) {
    return value.map(resolveToString).join('');
  }

  return '';
}
