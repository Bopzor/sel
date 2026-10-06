import type { Address } from '@sel/shared';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderTest } from 'src/tests/test-page';

import { AddressFormDialog } from './address-form-dialog';

const address: Address = {
  line1: '8 Boulevard du Port',
  postalCode: '80000',
  city: 'Amiens',
  country: 'France',
  position: [2.290084, 49.897442],
};

describe('AddressFormDialog', () => {
  let user: UserEvent;
  let onSubmit: (address: Address) => void;

  beforeEach(() => {
    user = userEvent.setup();
    onSubmit = vi.fn();
  });

  function Test({ address }: { address?: Address }) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>

        <AddressFormDialog
          open={open}
          onClose={() => setOpen(false)}
          address={address}
          title="Address"
          submitLabel="Save"
          onSubmit={onSubmit}
        />
      </>
    );
  }

  async function open() {
    await user.click(screen.getByRole('button', { name: 'Open' }));

    return screen.findByRole('dialog', { name: 'Address' });
  }

  it('submits the address, without an empty complement', async () => {
    renderTest(<Test />);

    const dialog = await open();

    await user.type(within(dialog).getByRole('textbox', { name: /^Number and street/ }), '1 chemin du Lac');
    await user.type(within(dialog).getByRole('textbox', { name: /^Postal code/ }), '74000');
    await user.type(within(dialog).getByRole('textbox', { name: /^City/ }), 'Annecy');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { line1: '1 chemin du Lac', postalCode: '74000', city: 'Annecy', country: 'France' },
      expect.anything(),
    );
  });

  it('keeps the position of an address that is not changed', async () => {
    renderTest(<Test address={address} />);

    await user.click(within(await open()).getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(address, expect.anything());
  });

  it('removes the position of an address changed by hand', async () => {
    renderTest(<Test address={address} />);

    const dialog = await open();

    await user.type(within(dialog).getByRole('textbox', { name: /^Number and street/ }), ' bis');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { line1: '8 Boulevard du Port bis', postalCode: '80000', city: 'Amiens', country: 'France' },
      expect.anything(),
    );
  });

  it('starts from the given address each time it opens', async () => {
    renderTest(<Test address={address} />);

    const line1 = () =>
      within(screen.getByRole('dialog')).getByRole('textbox', { name: /^Number and street/ });

    await open();
    await user.clear(line1());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await open();

    expect(line1()).toHaveValue('8 Boulevard du Port');
  });
});
