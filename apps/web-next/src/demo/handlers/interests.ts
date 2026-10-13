import { addInterestMemberBodySchema, editInterestMemberBodySchema, type Interest } from '@sel/shared';
import { createId } from '@sel/utils';

import { demo } from '../demo';

export const demoInterestRoutes = [
  demo.route('GET', '/interests', ({ state }) => {
    const interests = state.interests.toSorted((a, b) => a.label.localeCompare(b.label));

    return demo.json(interests.map((interest) => serializeInterest(state, interest)));
  }),

  demo.route('PUT', '/interests/:interestId/join', ({ state, params, body, member }) => {
    const interest = findInterest(state, params.interestId);
    const { description } = addInterestMemberBodySchema.parse(body);

    if (findMemberInterest(state, interest.id, member().id)) {
      throw new demo.Error(400, 'Interest was already added');
    }

    state.memberInterests.push({
      id: createId(),
      interestId: interest.id,
      memberId: member().id,
      description,
    });

    return demo.noContent();
  }),

  demo.route('PUT', '/interests/:interestId/edit', ({ state, params, body, member }) => {
    const memberInterest = findMemberInterest(state, params.interestId, member().id);
    const { description } = editInterestMemberBodySchema.parse(body);

    if (!memberInterest) {
      throw new demo.Error(400, 'Interest was not added');
    }

    memberInterest.description = description;

    return demo.noContent();
  }),

  demo.route('PUT', '/interests/:interestId/leave', ({ state, params, member }) => {
    const memberInterest = findMemberInterest(state, params.interestId, member().id);

    if (!memberInterest) {
      throw new demo.Error(400, 'Interest was not added');
    }

    state.memberInterests = state.memberInterests.filter(({ id }) => id !== memberInterest.id);

    return demo.noContent();
  }),
];

function serializeInterest(state: demo.State, interest: demo.Interest): Interest {
  return {
    id: interest.id,
    label: interest.label,
    description: interest.description,
    image: interest.image ?? '',
    members: state.memberInterests
      .filter(({ interestId }) => interestId === interest.id)
      .map((memberInterest) => ({
        ...demo.serializeLightMember(demo.findMember(state, memberInterest.memberId)),
        description: memberInterest.description,
      })),
  };
}

function findInterest(state: demo.State, interestId = '') {
  return state.interests.find(({ id }) => id === interestId) ?? demo.notFound('Interest');
}

function findMemberInterest(state: demo.State, interestId = '', memberId: string) {
  return state.memberInterests.find(
    (memberInterest) => memberInterest.interestId === interestId && memberInterest.memberId === memberId,
  );
}
