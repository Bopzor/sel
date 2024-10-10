import { RequestStatus } from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { BadRequest, NotFound } from 'src/infrastructure/http';
import { TOKENS } from 'src/tokens';

import { RequestCanceledEvent, RequestFulfilledEvent } from './request.entities';
import { findRequestById, updateRequest } from './request.persistence';

export type ChangeRequestStatusCommand = {
  requestId: string;
  status: RequestStatus.fulfilled | RequestStatus.canceled;
};

export async function changeRequestStatus(command: ChangeRequestStatusCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const { requestId, status } = command;

  const request = await findRequestById(requestId);

  if (!request) {
    throw new NotFound('Request not found');
  }

  if ([RequestStatus.fulfilled, RequestStatus.canceled].includes(request.status)) {
    throw new BadRequest('Request is not pending');
  }

  await updateRequest(requestId, { status });

  if (command.status === RequestStatus.fulfilled) {
    events.publish(new RequestFulfilledEvent(request.id));
  }

  if (command.status === RequestStatus.canceled) {
    events.publish(new RequestCanceledEvent(request.id));
  }
}
