export function isEnumValue<Values extends string>(enumType: Record<string, Values>) {
  const values = Object.values(enumType);

  return (value: unknown): value is Values => {
    return Object.values<unknown>(values).includes(value);
  };
}

export function parseEnumValue<Values extends string>(enumType: Record<string, Values>) {
  return (value: string | undefined) => {
    if (isEnumValue(enumType)(value)) {
      return value;
    }
  };
}
