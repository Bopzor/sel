// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
export function removeDiacriticCharacters(string: string) {
  return string.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
