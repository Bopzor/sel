import { Component } from 'solid-js';

import { selectAuthenticatedMember } from '../authentication/authentication.slice';
import { MemberAvatarName } from '../components/member-avatar-name';
import { selector } from '../store/selector';

export const ProfilePage: Component = () => {
  const member = selector(selectAuthenticatedMember);

  return (
    <div class="row items-center gap-6">
      <MemberAvatarName member={member()} classes={{ avatar: 'w-20 h-20', name: 'text-3xl' }} />
    </div>
  );
};
