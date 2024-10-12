import { Address } from '@sel/shared';
import { defined } from '@sel/utils';

import { AddressSearch } from '../../../components/address-search';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { getAuthenticatedMember, getRefetchAuthenticatedMember } from '../../../utils/authenticated-member';
import { createAsyncCall } from '../../../utils/create-async-call';

const T = Translate.prefix('profile.address');

export default function AddressPage() {
  const profileApi = container.resolve(TOKENS.profileApi);
  const refetchAuthenticatedMember = getRefetchAuthenticatedMember();
  const t = T.useTranslation();

  const [updateMemberProfile] = createAsyncCall(profileApi.updateMemberProfile.bind(profileApi), {
    onSuccess: () => refetchAuthenticatedMember(),
  });

  const authenticatedMember = getAuthenticatedMember();

  const handleSelected = (address: Address) => {
    const member = defined(authenticatedMember());

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
