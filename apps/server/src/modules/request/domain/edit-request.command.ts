import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';

import { RequestEditedEvent } from '../request.entities';
import { updateRequest } from '../request.persistence';

export type EditRequestCommand = {
  requestId: string;
  title: string;
  body: string;
};

export async function editRequest(command: EditRequestCommand): Promise<void> {
  const htmlParser = container.resolve(TOKENS.htmlParser);
  const events = container.resolve(TOKENS.events);

  await updateRequest(command.requestId, {
    title: command.title,
    html: command.body,
    text: htmlParser.getTextContent(command.body),
  });

  events.publish(new RequestEditedEvent(command.requestId));
}
