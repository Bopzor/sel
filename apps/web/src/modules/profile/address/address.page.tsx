import { Address, UpdateMemberProfileData } from '@sel/shared';
import { defined } from '@sel/utils';
import { createMutation } from '@tanstack/solid-query';

import { AddressSearch } from '../../../components/address-search';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { getAuthenticatedMember, getRefetchAuthenticatedMember } from '../../../utils/authenticated-member';

const T = Translate.prefix('profile.address');

export default function AddressPage() {
  const api = container.resolve(TOKENS.api);
  const authenticatedMember = getAuthenticatedMember();
  const refetchAuthenticatedMember = getRefetchAuthenticatedMember();
  const t = T.useTranslation();

  const mutation = createMutation(() => ({
    async mutationFn(data: UpdateMemberProfileData) {
      await api.updateMemberProfile({
        path: { memberId: authenticatedMember()!.id },
        body: data,
      });
    },
    async onSuccess() {
      await refetchAuthenticatedMember();
    },
  }));

  const handleSelected = (address: Address) => {
    const member = defined(authenticatedMember());

    mutation.mutate({
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
