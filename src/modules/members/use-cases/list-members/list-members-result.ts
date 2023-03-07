export type ListMembersResult = Array<ListMembersItem>;

export type ListMembersItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  address: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
    position: [lat: number, lng: number];
  };
};
