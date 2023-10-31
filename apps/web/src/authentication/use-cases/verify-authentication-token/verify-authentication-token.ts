import { createThunk } from '../../../store/create-thunk';
import { authenticatedMemberFetched } from '../../authentication.slice';

export const verifyAuthenticationToken = createThunk(
  async ({ dispatch, authenticationGateway }, token: string) => {
    const member = await authenticationGateway.verifyAuthenticationToken(token);

    dispatch(authenticatedMemberFetched(member));
  }
);
