import { createFactory } from '@sel/utils';
import { z } from 'zod';

export const addressSchema = z.object({
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  postalCode: z.string().trim().min(1),
  city: z.string().trim().min(1),
  country: z.string().trim().min(1),
  position: z.tuple([z.number(), z.number()]).optional(),
});

export type Address = z.infer<typeof addressSchema>;

export const createAddress = createFactory<Address>(() => ({
  line1: '',
  postalCode: '',
  city: '',
  country: '',
}));
