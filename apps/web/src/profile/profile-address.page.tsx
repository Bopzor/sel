import { Component } from 'solid-js';

import { selectAuthenticatedMember } from '../authentication/authentication.slice';
import { AddressSearch } from '../components/address-search';
import { Map } from '../components/map';
import { selector } from '../store/selector';

export const ProfileAddressPage: Component = () => {
  const member = selector(selectAuthenticatedMember);

  return (
    <>
      <AddressSearch onAddressSelected={() => {}} />

      <Map
        center={member().address?.position ?? [5.042, 43.836]}
        zoom={member().address?.position ? 14 : 11}
        class="h-[400px] rounded-lg shadow"
        markers={
          member().address?.position
            ? [{ isPopupOpen: false, position: member().address!.position! }]
            : undefined
        }
      />
    </>
  );
};
