import {
  Card,
  Icon,
  ListItem,
  ListItemButton,
  ListItemChevron,
  ListItemContent,
  ListItemLink,
  ListItemTitle,
  type IconName,
} from '@sel/ui';
import { entries } from '@sel/utils';

import { Link } from '../components/link';
import { navigation } from '../routes';
import { useSignOut } from '../sign-out';
import { t } from '../translations';

type Navigation = typeof navigation;

/** Every section, grouped as in the side navigation. Reached from "Plus" in the bottom navigation. */
export function NavigationPage() {
  const labels: Partial<{ [Group in keyof Navigation]: string }> = t.navigation.groups;

  return (
    <div className="mx-auto flex max-w-content flex-col gap-6">
      {entries(navigation).map(([group, items]) => (
        <section key={group} className="flex flex-col gap-2">
          {labels[group] && <h2 className="text-caption text-subtle">{labels[group]}</h2>}
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

function Entry({ path, label, icon }: { path: string; label: string; icon: IconName }) {
  return (
    <ListItem>
      <Icon name={icon} className="text-muted" />
      <ListItemContent>
        <ListItemTitle>
          <ListItemLink Link={Link} href={path}>
            {label}
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
          <ListItemButton onClick={signOut}>{t.signOut}</ListItemButton>
        </ListItemTitle>
      </ListItemContent>
    </ListItem>
  );
}
