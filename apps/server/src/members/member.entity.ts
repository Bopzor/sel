import { createDate, createFactory, createId } from '@sel/utils';

import { NotificationDeliveryType } from '../common/notification-delivery-type';

export enum MemberStatus {
  onboarding = 'onboarding',
  inactive = 'inactive',
  active = 'active',
}

export type Member = {
  id: string;
  status: MemberStatus;
  firstName: string;
  lastName: string;
  email: string;
  emailVisible: boolean;
  phoneNumbers: PhoneNumber[];
  bio?: string;
  address?: Address;
  membershipStartDate: Date;
  notificationDelivery: Record<NotificationDeliveryType, boolean>;
};

export const createMember = createFactory<Member>(() => ({
  id: createId(),
  status: MemberStatus.active,
  firstName: '',
  lastName: '',
  email: '',
  emailVisible: false,
  phoneNumbers: [],
  onboardingCompleted: false,
  membershipStartDate: createDate(),
  notificationDelivery: {
    [NotificationDeliveryType.email]: false,
    [NotificationDeliveryType.push]: false,
  },
}));

export type PhoneNumber = {
  number: string;
  visible: boolean;
};

export const createPhoneNumber = createFactory<PhoneNumber>(() => ({
  number: '',
  visible: false,
}));

export type Address = {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
  position?: [lng: number, lat: number];
};

export const createAddress = createFactory<Address>(() => ({
  line1: '',
  postalCode: '',
  city: '',
  country: '',
}));
