import { z } from 'zod';

export const requestAuthenticationLinkQuerySchema = z.object({
  email: z.email().min(1),
});

export const verifyAuthenticationTokenQuerySchema = z.object({
  token: z.string(),
});
