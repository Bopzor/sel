import { createAsyncCall } from '../utils/create-async-call';

export default {
  title: 'test',
};

export const test = () => {
  const [call, pending] = createAsyncCall(
    async () => {
      console.log('call');
    },
    {},
    { debounce: 1000 },
  );

  return (
    <div>
      <button onClick={call}>call</button>
      <div>{pending() ? 'pending' : 'idle'}</div>
    </div>
  );
};
