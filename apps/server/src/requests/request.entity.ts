export enum RequestStatus {
  pending = 'pending',
  fulfilled = 'fulfilled',
  canceled = 'canceled',
}

export type Request = {
  id: string;
  status: RequestStatus;
  date: Date;
  requesterId: string;
};
