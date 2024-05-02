import { Address } from '@sel/shared';
import { defined } from '@sel/utils';

import { authenticatedMember, getAppActions } from '../../../app-context';
import { AddressSearch } from '../../../components/address-search';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { createAsyncCall } from '../../../utils/create-async-call';

const T = Translate.prefix('profile.address');

export default function AddressPage() {
  const profileApi = container.resolve(TOKENS.profileApi);
  const { refreshAuthenticatedMember } = getAppActions();
  const t = T.useTranslation();

  const [updateMemberProfile] = createAsyncCall(profileApi.updateMemberProfile.bind(profileApi), {
    onSuccess: refreshAuthenticatedMember,
  });

  const member = defined(authenticatedMember());

  const handleSelected = (address: Address) => {
    updateMemberProfile(member.id, {
      firstName: member.firstName,
      lastName: member.lastName,
      emailVisible: member.emailVisible,
      phoneNumbers: member.phoneNumbers,
      address,
    });
  };

  return (
    <>
      <p>
        <T id="description" />
      </p>

      <AddressSearch
        placeholder={t('placeholder')}
        value={authenticatedMember()?.address}
        onSelected={(address) => handleSelected(address)}
        mapClass="max-h-md"
      />
    </>
  );
}
