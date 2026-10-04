import {
  createAuthenticatedMember,
  type AuthenticatedMember,
  type UpdateMemberProfileData,
  type File as UploadedFile,
} from '@sel/shared';
import { assert } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { ProfilePage } from './profile-page';

describe('profile', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it("shows the member's profile", async () => {
    renderPage();

    const membership = await findSection('Membership');
    expect(within(membership).getByText('42')).toBeDefined();
    expect(within(membership).getByText('March 12, 2024')).toBeDefined();
    expect(within(membership).getByText('15 units')).toBeDefined();

    expect(within(getSection('Name and photo')).getByText('Jason Talon')).toBeDefined();

    const contact = getSection('Contact');
    expect(within(contact).getByText('jason@domain.tld')).toBeDefined();
    expect(within(contact).getByText('Hidden from the other members')).toBeDefined();
    expect(within(contact).getByText('06 12 34 56 78')).toBeDefined();
    expect(within(contact).getByText('Visible to the other members')).toBeDefined();

    expect(within(getSection('About me')).getByText('I like gardening.')).toBeDefined();

    expect(screen.getByRole('link', { name: 'See my public profile' }).getAttribute('href')).toBe(
      routes.member('me'),
    );
  });

  it('shows when the member has no phone number and no presentation', async () => {
    server.member = { ...server.member, phoneNumber: undefined, bio: undefined };

    renderPage();

    expect(within(await findSection('Contact')).getByText('No phone number')).toBeDefined();
    expect(within(getSection('About me')).getByText(/You have not written anything/)).toBeDefined();
  });

  it("edits the member's name", async () => {
    renderPage();

    await edit('Name and photo');

    const firstName = screen.getByRole('textbox', { name: /^First name/ });
    await user.clear(firstName);
    await user.type(firstName, 'Jay');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Profile updated')).toBeDefined();
    expect(server.updated).toEqual([{ firstName: 'Jay', lastName: 'Talon' }]);
    expect(within(getSection('Name and photo')).getByText('Jay Talon')).toBeDefined();
  });

  it('does not accept an empty name', async () => {
    renderPage();

    await edit('Name and photo');
    await user.clear(screen.getByRole('textbox', { name: /^Last name/ }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('This field is required')).toBeDefined();
    expect(server.updated).toEqual([]);
  });

  it("changes the member's photo", async () => {
    renderPage();

    await edit('Name and photo');
    await uploadPhoto(user, new File(['...'], 'me.png', { type: 'image/png' }));

    await screen.findByRole('button', { name: 'Remove the photo' });
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Profile updated');

    expect(server.updated).toEqual([{ firstName: 'Jason', lastName: 'Talon', avatarFileName: 'f1.png' }]);
  });

  it('does not save while the photo is uploading', async () => {
    let endUpload!: () => void;
    server.uploadGate = new Promise((resolve) => (endUpload = resolve));

    renderPage();

    await edit('Name and photo');
    await uploadPhoto(user, new File(['...'], 'me.png', { type: 'image/png' }));

    const firstName = screen.getByRole('textbox', { name: /^First name/ });
    await user.type(firstName, '{Enter}');

    expect(server.updated).toEqual([]);

    endUpload();
    await screen.findByRole('button', { name: 'Remove the photo' });
    await user.type(firstName, '{Enter}');
    await screen.findByText('Profile updated');

    expect(server.updated).toEqual([{ firstName: 'Jason', lastName: 'Talon', avatarFileName: 'f1.png' }]);
  });

  it('does not upload a photo that is not an image', async () => {
    user = userEvent.setup({ applyAccept: false });

    renderPage();

    await edit('Name and photo');
    await uploadPhoto(user, new File(['...'], 'me.pdf', { type: 'application/pdf' }));

    expect(await screen.findByText('The photo must be an image')).toBeDefined();
    expect(server.uploaded).toEqual([]);
  });

  it('does not upload a photo larger than 10 MB', async () => {
    renderPage();

    const file = new File(['...'], 'me.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });

    await edit('Name and photo');
    await uploadPhoto(user, file);

    expect(await screen.findByText('The photo must be at most 10 MB')).toBeDefined();
    expect(server.uploaded).toEqual([]);
  });

  it('keeps the current photo when the upload fails', async () => {
    server.member = { ...server.member, avatar: 'avatar.png' };
    server.uploadFailing = true;

    renderPage();

    await edit('Name and photo');
    await uploadPhoto(user, new File(['...'], 'me.png', { type: 'image/png' }));

    expect(await screen.findByText('The photo could not be sent. Try again in a few moments.')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Profile updated');

    expect(server.updated).toEqual([{ firstName: 'Jason', lastName: 'Talon', avatarFileName: 'avatar.png' }]);
  });

  it("removes the member's photo", async () => {
    server.member = { ...server.member, avatar: 'avatar.png' };

    renderPage();

    await edit('Name and photo');
    await user.click(screen.getByRole('button', { name: 'Remove the photo' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Profile updated');

    expect(server.updated).toEqual([{ firstName: 'Jason', lastName: 'Talon', avatarFileName: null }]);
  });

  it('cancels the changes', async () => {
    renderPage();

    await edit('Name and photo');
    await user.type(screen.getByRole('textbox', { name: /^First name/ }), 'y');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(within(getSection('Name and photo')).getByText('Jason Talon')).toBeDefined();
    expect(document.activeElement).toBe(
      within(getSection('Name and photo')).getByRole('button', { name: 'Edit Name and photo' }),
    );

    await edit('Name and photo');

    expect(screen.getByRole('textbox', { name: /^First name/ })).toHaveProperty('value', 'Jason');
    expect(server.updated).toEqual([]);
  });

  it("edits the member's contact", async () => {
    renderPage();

    await edit('Contact');

    const email = screen.getByRole('textbox', { name: /^Email address/ });
    expect(email).toHaveProperty('value', 'jason@domain.tld');
    expect(email).toHaveProperty('readOnly', true);

    const phoneNumber = screen.getByRole('textbox', { name: /^Phone number/ });
    expect(phoneNumber).toHaveProperty('value', '06 12 34 56 78');

    await user.clear(phoneNumber);
    await user.type(phoneNumber, '+33 7.98.76.54.32');
    await user.click(screen.getByRole('checkbox', { name: 'Show my email address to the other members' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Profile updated');

    expect(server.updated).toEqual([
      { emailVisible: true, phoneNumberVisible: true, phoneNumber: '0798765432' },
    ]);
  });

  it('does not accept an invalid phone number', async () => {
    renderPage();

    await edit('Contact');

    const phoneNumber = screen.getByRole('textbox', { name: /^Phone number/ });
    await user.clear(phoneNumber);
    await user.type(phoneNumber, '12 34');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Enter a phone number such as 06 12 34 56 78')).toBeDefined();
    expect(server.updated).toEqual([]);
  });

  it('does not remove the phone number', async () => {
    renderPage();

    await edit('Contact');
    await user.clear(screen.getByRole('textbox', { name: /^Phone number/ }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Your phone number cannot be removed, only changed')).toBeDefined();
    expect(server.updated).toEqual([]);
  });

  it("edits the member's presentation", async () => {
    renderPage();

    await edit('About me');

    const bio = screen.getByRole('textbox', { name: /^Presentation/ });
    await user.clear(bio);
    await user.type(bio, '  I like cooking.  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Profile updated');

    expect(server.updated).toEqual([{ bio: 'I like cooking.' }]);
    expect(within(getSection('About me')).getByText('I like cooking.')).toBeDefined();
  });

  it("removes the member's presentation", async () => {
    renderPage();

    await edit('About me');
    await user.clear(screen.getByRole('textbox', { name: /^Presentation/ }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Profile updated');

    expect(server.updated).toEqual([{ bio: '' }]);
    expect(within(getSection('About me')).getByText(/You have not written anything/)).toBeDefined();
  });

  it('shows an alert when the changes could not be saved, and keeps the form', async () => {
    server.failing = true;

    renderPage();

    await edit('About me');
    await user.type(screen.getByRole('textbox', { name: /^Presentation/ }), ' And cooking.');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Your changes could not be saved');
    expect(screen.getByRole('textbox', { name: /^Presentation/ })).toHaveProperty(
      'value',
      'I like gardening. And cooking.',
    );
  });

  async function edit(section: string) {
    await user.click(await screen.findByRole('button', { name: `Edit ${section}` }));
  }
});

async function findSection(title: string) {
  return sectionOf(await screen.findByRole('heading', { name: title }));
}

function getSection(title: string) {
  return sectionOf(screen.getByRole('heading', { name: title }));
}

async function uploadPhoto(user: ReturnType<typeof userEvent.setup>, file: File) {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  assert(input !== null);

  await user.upload(input, file);
}

function sectionOf(heading: HTMLElement) {
  const section = heading.parentElement?.parentElement;
  assert(section);

  return section;
}

function renderPage() {
  return renderTestPage(routes.profile(), [
    {
      path: routes.profile(),
      loader: requireSession,
      Component: ProfilePage,
    },
  ]);
}

class Server extends FakeServer {
  member: AuthenticatedMember = createAuthenticatedMember({
    id: 'me',
    number: 42,
    firstName: 'Jason',
    lastName: 'Talon',
    email: 'jason@domain.tld',
    emailVisible: false,
    phoneNumber: '0612345678',
    phoneNumberVisible: true,
    bio: 'I like gardening.',
    membershipStartDate: '2024-03-12T10:00:00.000Z',
    balance: 15,
  });

  updated: UpdateMemberProfileData[] = [];
  uploaded: string[] = [];
  uploadFailing = false;
  uploadGate?: Promise<void>;
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(this.member));

    this.register('POST /api/files/upload', async ({ body }) => {
      await this.uploadGate;

      if (this.uploadFailing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      const file = (body as FormData).get('file') as File;
      this.uploaded.push(file.name);

      return this.json(
        { id: 'f1', name: 'f1.png', originalName: file.name, mimetype: file.type } satisfies UploadedFile,
        { status: 201 },
      );
    });

    this.register('PUT /api/members/me/profile', ({ body }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      const data = body as UpdateMemberProfileData;

      this.updated.push(data);
      this.member = {
        ...this.member,
        ...data,
        avatar: data.avatarFileName === undefined ? this.member.avatar : (data.avatarFileName ?? undefined),
        bio: data.bio === undefined ? this.member.bio : (data.bio ?? undefined),
      } as AuthenticatedMember;

      return Promise.resolve(new Response(null, { status: 200 }));
    });
  }
}
