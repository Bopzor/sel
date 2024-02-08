import { Translate } from '../../../intl/translate';

const T = Translate.prefix('members');

export function MemberNotFound() {
  return (
    <div class="col my-6 items-center gap-2">
      <h1>
        <T id="notFound.title" />
      </h1>
      <p>
        <T id="notFound.description" />
      </p>
    </div>
  );
}
