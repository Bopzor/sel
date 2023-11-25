import { Address } from '@sel/shared';
import { Component } from 'solid-js';

import { selectAuthenticatedMember } from '../authentication/authentication.slice';
import { fetchAuthenticatedMember } from '../authentication/use-cases/fetch-authenticated-member/fetch-authenticated-member';
import { AddressSearch } from '../components/address-search';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { selector } from '../store/selector';
import { store } from '../store/store';
import { TOKENS } from '../tokens';

const T = Translate.prefix('profile.address');

export const AddressPage: Component = () => {
  const t = T.useTranslation();
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
