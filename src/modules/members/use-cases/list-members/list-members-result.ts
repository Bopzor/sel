export type ListMembersResult = Array<ListMembersItem>;

export type ListMembersItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};
