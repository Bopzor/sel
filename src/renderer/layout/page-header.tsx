import { Translation } from '../../app/i18n.context';
import { MemberAvatarName } from '../../modules/members/components/member-avatar-name';

import logo from './logo.png';

const T = Translation.create('layout');

export const PageHeader = () => (
  <header className="bg-primary py-1 text-inverted">
    <div className="content row items-center">
      <a href="/" className="row mr-auto items-center gap-2">
        <img src={logo} alt="Logo" width={64} height={64} />
        <span className="text-lg font-semibold md:text-xl">
          <T>Local trading system</T>
        </span>
      </a>

      <MemberAvatarName />
    </div>
  </header>
);
