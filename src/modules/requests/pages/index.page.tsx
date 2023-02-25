import { useQuery } from '../../../app/api.context';
import { ListRequestsHandler } from '../use-cases/list-requests/list-requests';

export const Page = () => {
  const [request, { loading }] = useQuery(ListRequestsHandler, {});

  if (loading) {
    return <>...Loading...</>;
  }

  return <>Demandes : {JSON.stringify(request)}</>;
};
