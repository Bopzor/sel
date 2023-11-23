import { Address } from '@sel/shared';
import { Component } from 'solid-js';

import { selectAuthenticatedMember } from '../authentication/authentication.slice';
import { fetchAuthenticatedMember } from '../authentication/use-cases/fetch-authenticated-member/fetch-authenticated-member';
import { AddressSearch } from '../components/address-search';
import { container } from '../infrastructure/container';
import { selector } from '../store/selector';
import { store } from '../store/store';
import { TOKENS } from '../tokens';

export const ProfileAddressPage: Component = () => {
  const member = selector(selectAuthenticatedMember);

  const handleSelected = async (address: Address) => {
    const memberProfileGateway = container.resolve(TOKENS.memberProfileGateway);

    const data = member();

    await memberProfileGateway.updateMemberProfile(data.id, {
      firstName: data.firstName,
      lastName: data.lastName,
      emailVisible: data.emailVisible,
      phoneNumbers: data.phoneNumbers,
      address,
    });

    await store.dispatch(fetchAuthenticatedMember());
  };

  return <AddressSearch value={member().address} onSelected={(address) => void handleSelected(address)} />;
};
