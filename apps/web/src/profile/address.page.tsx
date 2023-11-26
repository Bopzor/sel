import { Address, UpdateMemberProfileData } from '@sel/shared';
import { Component } from 'solid-js';

import { AddressSearch } from '../components/address-search';
import { Translate } from '../intl/translate';
import { getAuthenticatedMember } from '../utils/authenticated-member';
import { mutation } from '../utils/mutation';
import { notify } from '../utils/notify';

const T = Translate.prefix('profile.address');

export const AddressPage: Component = () => {
  const t = T.useTranslation();
  const member = getAuthenticatedMember();

  const [updateMemberProfile] = mutation((fetcher) => ({
    key: ['updateMemberProfile'],
    async mutate(data: UpdateMemberProfileData) {
      await fetcher.put(`/api/members/${member().id}/profile`, data);
    },
    invalidate: ['authenticatedMember'],
    onSuccess: () => notify.success(t('saved')),
  }));

  const handleSelected = (address: Address) => {
    const data = member();

    updateMemberProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      emailVisible: data.emailVisible,
      phoneNumbers: data.phoneNumbers,
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
        value={member().address}
        onSelected={(address) => handleSelected(address)}
      />
    </>
  );
};
