import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  Card,
  Icon,
  ListItem,
  ListItemButton,
  ListItemChevron,
  ListItemContent,
  ListItemLink,
  ListItemTitle,
} from '@sel/ui';
import { entries } from '@sel/utils';

import { navigation, type NavigationItem } from 'src/app/routes';
import { useSignOut } from 'src/app/session';
import { Link } from 'src/components/link';

export function NavigationPage() {
  const { i18n } = useLingui();

  const labels: Partial<{ [Group in keyof typeof navigation]: MessageDescriptor }> = {
    exchanges: msg`Exchanges`,
    community: msg`Community`,
    account: msg`My account`,
  };

  return (
    <div className="mx-auto stack max-w-content gap-6">
      {entries(navigation).map(([group, items]) => (
        <section key={group} className="stack gap-2">
          {labels[group] && <h2 className="text-caption text-subtle">{i18n._(labels[group])}</h2>}
          <Card>
            <ul>
              {Object.values(items).map((entry) => (
                <Entry key={entry.path} {...entry} />
              ))}
              {group === 'account' && <SignOutItem />}
            </ul>
          </Card>
        </section>
      ))}
    </div>
  );
}

function Entry({ path, label, icon }: NavigationItem) {
  const { t } = useLingui();

  return (
    <ListItem>
      <Icon name={icon} className="text-muted" />
      <ListItemContent>
        <ListItemTitle>
          <ListItemLink Link={Link} href={path}>
            {t(label)}
          </ListItemLink>
        </ListItemTitle>
      </ListItemContent>
      <ListItemChevron />
    </ListItem>
  );
}

function SignOutItem() {
  const signOut = useSignOut();

  return (
    <ListItem>
      <Icon name="sign-out" className="text-muted" />
      <ListItemContent>
        <ListItemTitle>
          <ListItemButton onClick={signOut}>
            <Trans>Sign out</Trans>
          </ListItemButton>
        </ListItemTitle>
      </ListItemContent>
    </ListItem>
  );
}
