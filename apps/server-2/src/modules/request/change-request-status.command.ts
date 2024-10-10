import { RequestStatus } from '@sel/shared';
import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import {
  RequestCanceledEvent,
  RequestFulfilledEvent,
  RequestIsNotPendingError,
  RequestNotFoundError,
} from './request.entities';

export type ChangeRequestStatusCommand = {
  requestId: string;
  status: RequestStatus.fulfilled | RequestStatus.canceled;
};

export async function changeRequestStatus(command: ChangeRequestStatusCommand): Promise<void> {
  const now = container.resolve(TOKENS.date).now();
  const events = container.resolve(TOKENS.events);

  const { requestId, status } = command;

  const request = await db.query.requests.findFirst({
    where: eq(schema.requests.id, requestId),
  });

  if (!request) {
    throw new RequestNotFoundError();
  }

  if ([RequestStatus.fulfilled, RequestStatus.canceled].includes(request.status)) {
    throw new RequestIsNotPendingError();
  }

  await db
    .update(schema.requests)
    .set({
      status,
      updatedAt: now,
    })
    .where(eq(schema.requests.id, requestId));

  if (command.status === RequestStatus.fulfilled) {
    events.publish(new RequestFulfilledEvent(request.id));
  }

  if (command.status === RequestStatus.canceled) {
    events.publish(new RequestCanceledEvent(request.id));
  }
}
