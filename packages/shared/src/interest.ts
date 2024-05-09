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
