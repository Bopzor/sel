export type Interest = {
  id: string;
  label: string;
  members: Array<[InterestMember, MemberInterest]>;
};

export type InterestMember = {
  id: string;
  firstName: string;
  lastName: string;
};

export type MemberInterest = {
  id: string;
  label: string;
  description?: string;
};
