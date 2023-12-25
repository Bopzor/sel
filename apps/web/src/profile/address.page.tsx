import { Address } from '@sel/shared';
import { defined } from '@sel/utils';
import { Component } from 'solid-js';

import { AddressSearch } from '../components/address-search';
import { Translate } from '../intl/translate';
import { getAppState, getAppActions } from '../store/app-store';
import { createAsyncCall } from '../utils/async-call';

const T = Translate.prefix('profile.address');

export const AddressPage: Component = () => {
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
      <h1>
        <T id="title" />
      </h1>

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
};
