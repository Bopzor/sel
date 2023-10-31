import { createThunk } from '../../../store/create-thunk';
import { authenticationLinkRequested } from '../../authentication.slice';

export const requestAuthenticationLink = createThunk(
  async ({ dispatch, authenticationGateway }, email: string) => {
    await authenticationGateway.requestAuthenticationLink(email);

    dispatch(authenticationLinkRequested());
  }
);
