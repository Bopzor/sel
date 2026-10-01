import { z } from 'zod';

export const requestAuthenticationCodeQuerySchema = z.object({
  email: z.email().min(1),
  /** The page of the app to go to once signed in, added to the link of the email. */
  next: z.string().startsWith('/').optional(),
});

export const verifyAuthenticationCodeQuerySchema = z.object({
  code: z.string(),
});
