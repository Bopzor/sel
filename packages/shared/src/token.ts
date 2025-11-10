import { z } from 'zod';

export const requestAuthenticationCodeQuerySchema = z.object({
  email: z.email().min(1),
});

export const verifyAuthenticationCodeQuerySchema = z.object({
  code: z.string(),
});
