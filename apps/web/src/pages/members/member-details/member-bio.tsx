import { Member } from '@sel/shared';

export function MemberBio(props: { member: Member }) {
  return <p>{props.member.bio}</p>;
}
