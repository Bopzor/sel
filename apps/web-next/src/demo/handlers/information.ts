import {
  createInformationBodySchema,
  listInformationQuerySchema,
  updateInformationBodySchema,
  type Information,
} from '@sel/shared';
import { createId } from '@sel/utils';

import { demo } from '../demo';

export const demoInformationRoutes = [
  demo.route('GET', '/information', ({ state, query }) => {
    const { search, authorId, ...page } = listInformationQuerySchema.parse(query);

    const information = state.information
      .filter(({ title, message }) => search === undefined || demo.matchesSearch(search, title, message))
      .filter((information) => authorId === undefined || information.authorId === authorId)
      .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    return demo.paginated(
      information.map((information) => serializeInformation(state, information)),
      page,
    );
  }),

  demo.route('GET', '/information/:informationId', ({ state, params }) => {
    return demo.json(serializeInformation(state, findInformation(state, params.informationId)));
  }),

  demo.route('POST', '/information', ({ state, body, member }) => {
    const { title, body: text, fileIds } = createInformationBodySchema.parse(body);
    const id = createId();

    state.information.push({
      id,
      title,
      message: demo.createMessage(state, text, fileIds),
      authorId: member().id,
      publishedAt: new Date().toISOString(),
    });

    return demo.created(id);
  }),

  demo.route('PUT', '/information/:informationId', ({ state, params, body, member }) => {
    const information = findInformation(state, params.informationId);
    const { title, body: text, fileIds } = updateInformationBodySchema.parse(body);

    if (information.authorId !== member().id) {
      throw new demo.Error(403, 'Member must be the author of the information');
    }

    information.title = title;
    information.message = demo.createMessage(state, text, fileIds);

    return demo.noContent();
  }),
];

function findInformation(state: demo.State, informationId = '') {
  return state.information.find(({ id }) => id === informationId) ?? demo.notFound('Information');
}

function serializeInformation(state: demo.State, information: demo.Information): Information {
  const { authorId } = information;

  return {
    id: information.id,
    title: information.title,
    message: information.message,
    author: authorId === undefined ? undefined : demo.serializeLightMember(demo.findMember(state, authorId)),
    publishedAt: information.publishedAt,
  };
}
