import { Address, UpdateMemberProfileData } from '@sel/shared';
import { useQueryClient, createMutation } from '@tanstack/solid-query';
import { Component } from 'solid-js';

import { AddressSearch } from '../components/address-search';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { TOKENS } from '../tokens';
import { getAuthenticatedMember } from '../utils/authenticated-member';

const T = Translate.prefix('profile.address');

export const AddressPage: Component = () => {
  const t = T.useTranslation();
  const member = getAuthenticatedMember();

  const fetcher = container.resolve(TOKENS.fetcher);
  const queryClient = useQueryClient();

  const updateMemberProfile = createMutation(() => ({
    mutationFn: (data: UpdateMemberProfileData) => fetcher.put(`/api/members/${member().id}/profile`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authenticatedMember'] }),
  }));

  const handleSelected = (address: Address) => {
    const data = member();

    void updateMemberProfile.mutate({
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
        onSelected={(address) => void handleSelected(address)}
      />
    </>
  );
};
