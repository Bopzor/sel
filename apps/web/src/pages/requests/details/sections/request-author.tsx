import { Request } from '@sel/shared';

import { Card } from 'src/components/card';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { MemberContactInfo } from 'src/components/member-contact-info';

export function RequestAuthor(props: { request: Request }) {
  return (
    <Card>
      <MemberAvatarName
        member={props.request.requester}
        classes={{ root: 'col my-8 mx-auto', avatar: '!size-32', name: 'text-xl' }}
      />

      <MemberContactInfo member={props.request.requester} />
    </Card>
  );
}
