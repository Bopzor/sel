import { useQuery } from '@tanstack/solid-query';
import { createSignal } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { List } from 'src/components/list';
import { Query } from 'src/components/query';
import { BoxSkeleton } from 'src/components/skeleton';
import { createTranslate } from 'src/intl/translate';

import { InterestItem } from './components/interest-item';

const T = createTranslate('pages.interests');

export function InterestsPage() {
  const query = useQuery(() => apiQuery('listInterests', {}));
  const [expanded, setExpanded] = createSignal<string>();

  return (
    <>
      <h1 class="mb-8">
        <T id="title" />
      </h1>

      <Query query={query} pending={<Skeleton />}>
        {(interests) => (
          <List each={interests} class="col gap-8">
            {(interest) => (
              <InterestItem
                interest={interest}
                expanded={expanded() === interest.id}
                toggleExpanded={() => (expanded() === interest.id ? setExpanded() : setExpanded(interest.id))}
              />
            )}
          </List>
        )}
      </Query>
    </>
  );
}

function Skeleton() {
  return (
    <div class="col gap-8">
      <BoxSkeleton height={10} />
      <BoxSkeleton height={10} />
      <BoxSkeleton height={10} />
    </div>
  );
}
