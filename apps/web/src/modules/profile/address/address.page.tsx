import { Address } from '@sel/shared';
import { defined } from '@sel/utils';

import { AddressSearch } from '../../../components/address-search';
import { Translate } from '../../../intl/translate';
import { getAppActions, getAppState } from '../../../store/app-store';
import { createAsyncCall } from '../../../utils/async-call';

const T = Translate.prefix('profile.address');

export default function AddressPage() {
  const t = T.useTranslation();
  const state = getAppState();

  const actions = getAppActions();
  const [updateMemberProfile] = createAsyncCall(actions.updateMemberProfile);

  const handleSelected = (address: Address) => {
    const member = defined(state.authenticatedMember);

    updateMemberProfile({
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
        value={state.authenticatedMember?.address}
        onSelected={(address) => handleSelected(address)}
      />
    </>
  );
}
