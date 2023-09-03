export type Address = {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
  position: [lat: number, lng: number];
};

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  address: Address;
};
