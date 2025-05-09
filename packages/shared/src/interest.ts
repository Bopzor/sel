import { z } from 'zod';

export type Interest = {
  id: string;
  label: string;
  description: string;
  image: string;
  members: InterestMember[];
};

export type InterestMember = {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  description?: string;
};

export type MemberInterest = {
  id: string;
  interestId: string;
  label: string;
  description?: string;
};

export const addInterestMemberBodySchema = z.object({
  description: z.string().min(1).optional(),
});

export type AddInterestMemberBody = z.infer<typeof addInterestMemberBodySchema>;

export const editInterestMemberBodySchema = z.object({
  description: z.string().min(1).optional(),
});

export type EditInterestMemberBody = z.infer<typeof addInterestMemberBodySchema>;

export const createInterestBodySchema = z.object({
  label: z.string().trim().min(3).max(50),
  description: z.string().trim().max(400),
  imageId: z.string().min(16).max(16),
});

export type CreateInterestBodySchema = z.infer<typeof createInterestBodySchema>;

export const updateInterestBodySchema = z
  .object({
    label: z.string().trim().min(3).max(50),
    description: z.string().trim().max(400),
    imageId: z.string().min(16).max(16),
  })
  .partial();

export type UpdateInterestBodySchema = z.infer<typeof updateInterestBodySchema>;
