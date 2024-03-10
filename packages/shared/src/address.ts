import { createFactory } from '@sel/utils';
import { z } from 'zod';

export const addressSchema = z.object({
  line1: z.string().trim(),
  line2: z.string().trim().optional(),
  postalCode: z.string().trim(),
  city: z.string().trim(),
  country: z.string().trim(),
  position: z.tuple([z.number(), z.number()]).optional(),
});

export type Address = z.infer<typeof addressSchema>;

export const createAddress = createFactory<Address>(() => ({
  line1: '',
  postalCode: '',
  city: '',
  country: '',
}));
