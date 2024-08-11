import { Member } from '@sel/shared';
import { removeDiacriticCharacters } from '@sel/utils';

export function filteredMemberList(members: Member[], search: string) {
  return members.filter((member) =>
    [member.firstName, member.lastName]
      .map(removeDiacriticCharacters)
      .some((value) => value.toLowerCase().includes(removeDiacriticCharacters(search.toLowerCase()))),
  );
}
