import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { useQuery } from '../../../../app/hooks/use-query';
import { TOKENS } from '../../../../tokens';

const MembersListPage = () => {
  const [members] = useQuery(TOKENS.listMembersHandler, {});

  return (
    <>
      <Show when={members} fallback={<FallbackSpinner />}>
        {(members) => members.map((member) => <div key={member.id}>{member.id}</div>)}
      </Show>
    </>
  );
};

export const Page = MembersListPage;
