import { authenticatedMember } from '../../../app-context';
import { Button } from '../../../components/button';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { Translate } from '../../../intl/translate';

export function ProfileEditionHeader(props: { isDirty: boolean; isSubmitting: boolean }) {
  return (
    <>
      <MemberAvatarName member={authenticatedMember()} classes={{ avatar: '!size-20', name: 'typo-h1' }} />

      <div
        class="col sm:row ml-auto gap-2 transition-opacity"
        classList={{ 'opacity-0 pointer-events-none': !props.isDirty }}
      >
        <Button variant="secondary" type="reset" form="profile-form">
          <Translate id="common.cancel" />
        </Button>

        <Button type="submit" form="profile-form" loading={props.isSubmitting}>
          <Translate id="common.save" />
        </Button>
      </div>
    </>
  );
}
