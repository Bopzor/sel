import { createThunk } from '../../../store/create-thunk';
import { authenticatedMemberFetched } from '../../authentication.slice';

export const fetchAuthenticatedMember = createThunk(async ({ dispatch, authenticationGateway }) => {
  const member = await authenticationGateway.getAuthenticatedMember();

  if (member) {
    dispatch(authenticatedMemberFetched(member));
  }
});
