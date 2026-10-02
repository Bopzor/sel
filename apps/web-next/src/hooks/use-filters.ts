import { useSearchParams } from 'react-router';
import type { z } from 'zod';

type FiltersSchema = z.ZodObject<Record<string, z.ZodType<string | number | boolean, string | undefined>>>;

// Each field of the schema needs a .catch(default): a filter missing from the URL takes its default value.
export function useFilters<Schema extends FiltersSchema>(schema: Schema) {
  type Filters = z.output<Schema>;

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultFilters: Filters = schema.parse({});
  const filters: Filters = schema.parse(Object.fromEntries(searchParams));

  const hasFilters = Object.keys(filters).some((name) => filters[name] !== defaultFilters[name]);

  const setFilters = (changes: Partial<Filters>, options?: { replace?: boolean }) => {
    setSearchParams((params) => {
      for (const [name, value] of Object.entries(changes)) {
        if (value === undefined || value === defaultFilters[name]) {
          params.delete(name);
        } else {
          params.set(name, String(value));
        }
      }

      return params;
    }, options);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return { filters, setFilters, hasFilters, resetFilters };
}
