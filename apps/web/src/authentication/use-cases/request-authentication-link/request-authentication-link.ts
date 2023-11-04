import { createAsyncThunk } from '../../../store/create-thunk';

export const requestAuthenticationLink = createAsyncThunk(
  'requestAuthenticationLink',
  async ({ authenticationGateway }, email: string) => {
    return authenticationGateway.requestAuthenticationLink(email);
  }
);
