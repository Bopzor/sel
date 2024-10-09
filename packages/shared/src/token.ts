import { z } from 'zod';

export const requestAuthenticationLinkQuerySchema = z.object({
  email: z.string().email(),
});

export const verifyAuthenticationTokenQuerySchema = z.object({
  token: z.string(),
});
