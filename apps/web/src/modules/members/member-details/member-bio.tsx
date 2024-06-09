import { Member } from '@sel/shared';

export function MemberBio(props: { member: Member }) {
  return (
    <div class="card col gap-4 p-4 md:p-8">
      <p>{props.member.bio}</p>
    </div>
  );
}
