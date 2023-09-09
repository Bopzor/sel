export function flattenTranslations(obj: object, prefix = '') {
  let result: Record<PropertyKey, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[`${prefix !== '' ? `${prefix}.` : ''}${key}`] = value;
    } else if (typeof value === 'object' && value !== null) {
      result = {
        ...result,
        ...flattenTranslations(value as object, `${prefix}.${key}`.replace(/^\./, '')),
      };
    } else {
      throw new Error(`Cannot flatten value of type "${typeof value}"`);
    }
  }

  return result;
}
