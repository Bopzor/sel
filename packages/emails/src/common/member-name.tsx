import { Translate, translate } from '../intl/intl';

type MemberNameProps = {
  member: {
    firstName: string;
    lastName: string;
  };
};

export function MemberName(props: MemberNameProps) {
  return (
    <Translate
      message="{firstName} {lastName}"
      values={{
        firstName: props.member.firstName,
        lastName: props.member.lastName,
      }}
    />
  );
}

MemberName.text = (member: MemberNameProps['member']) => {
  return translate('{firstName} {lastName}', {
    firstName: member.firstName,
    lastName: member.lastName,
  }) as string;
};
