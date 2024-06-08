import { z } from 'zod';

export type Interest = {
  id: string;
  label: string;
  description: string;
  members: InterestMember[];
};

export type InterestMember = {
  id: string;
  firstName: string;
  lastName: string;
  description?: string;
};

export type MemberInterest = {
  id: string;
  label: string;
  description?: string;
};

export const addInterestMemberBodySchema = z.object({
  description: z.string().min(1).optional(),
});

export type AddInterestMemberBody = z.infer<typeof addInterestMemberBodySchema>;
