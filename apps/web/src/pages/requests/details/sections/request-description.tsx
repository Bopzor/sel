import { Request } from '@sel/shared';

import { Card } from 'src/components/card';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { Message } from 'src/components/message';

export function RequestDescription(props: { request: Request }) {
  return (
    <Card
      title={
        <MemberAvatarName
          member={props.request.requester}
          classes={{ name: 'font-medium text-text', root: 'lg:hidden' }}
        />
      }
      classes={{ content: 'lg:p-8' }}
    >
      <Message message={props.request.message} />
    </Card>
  );
}
