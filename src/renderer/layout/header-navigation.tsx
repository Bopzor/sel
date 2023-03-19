import { LinkButton } from '../../app/components/button';
import { Translation } from '../../app/i18n.context';

const T = Translation.create('layout');

export const Navigation = () => (
  <nav className="mt-1 grid grid-cols-2 gap-1 text-neutral md:ml-auto md:max-w-[48rem] md:grid-cols-4">
    <LinkButton href="/demandes" className="!inline-block !bg-requests text-center !text-inherit">
      <T>Requests</T>
    </LinkButton>

    <LinkButton href="/événements" className="!inline-block !bg-events text-center !text-inherit">
      <T>Events</T>
    </LinkButton>

    <LinkButton href="/membres" className="!inline-block !bg-members text-center !text-inherit">
      <T>Members</T>
    </LinkButton>

    <LinkButton href="#" className="!inline-block !bg-tools text-center !text-inherit">
      <T>Tools</T>
    </LinkButton>
  </nav>
);
