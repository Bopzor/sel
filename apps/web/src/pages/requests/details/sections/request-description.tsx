import { Request } from '@sel/shared';

import { Card } from 'src/components/card';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { RichText } from 'src/components/rich-text';

export function RequestDescription(props: { request: Request }) {
  return (
    <Card
      title={
        <MemberAvatarName
          member={props.request.requester}
          classes={{ name: 'font-medium text-text', root: 'lg:hidden' }}
        />
      }
      class="lg:p-8"
    >
      <RichText>{props.request.message.body}</RichText>
    </Card>
  );
}
