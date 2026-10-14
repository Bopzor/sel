import {
  ProfileStep,
  type AuthenticatedMember,
  type UpdateMemberProfileData,
  type File as UploadedFile,
} from '@sel/shared';
import { createAuthenticatedMember } from '@sel/shared/factories';
import { assert, unique } from '@sel/utils';
import { screen } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';
import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { ProfileCompletionCard } from './profile-completion-card';

describe('profile completion card', () => {
  let user: UserEvent;
  let server: Server;
  let device: { mobile: boolean; installed: boolean };

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    device = { mobile: false, installed: false };

    vi.stubGlobal('fetch', server.fetch);
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(display-mode: standalone)' && device.installed,
    }));

    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      get: () => ({ mobile: device.mobile }),
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'userAgentData');
  });

  function render() {
    queryClient.setQueryData(queries.session().queryKey, structuredClone(server.member));

    renderTest(
      <MemoryRouter>
        <ProfileCompletionCard />
      </MemoryRouter>,
    );
  }

  // The steps before this one were already completed.
  function startAt(step: ProfileStep) {
    const steps = Object.values(ProfileStep);

    server.member.completedProfileSteps = steps.slice(0, steps.indexOf(step));
  }

  function stepTitle() {
    return screen.getByRole('heading');
  }

  it('shows the first step that is not completed', () => {
    render();

    expect(stepTitle()).toHaveTextContent('Is your name correct?');
  });

  it('completes a step and moves to the next one', async () => {
    render();

    await user.click(screen.getByRole('button', { name: "That's it" }));

    expect(await screen.findByText('Add your phone number')).toBeInTheDocument();
    expect(server.updated).toEqual([{ completedProfileSteps: [ProfileStep.name] }]);
  });

  it('completes a skipped step', async () => {
    startAt(ProfileStep.address);
    render();

    await user.click(screen.getByRole('button', { name: 'Skip' }));

    expect(await screen.findByText('Add a photo')).toBeInTheDocument();
    expect(server.updated).toEqual([{ completedProfileSteps: [ProfileStep.address] }]);
  });

  it('saves the visibility of the contact details right away', async () => {
    startAt(ProfileStep.contactVisibility);
    server.member.phoneNumber = '0612345678';
    render();

    await user.click(screen.getByRole('switch', { name: 'Show my email address on my member page' }));

    await vi.waitFor(() => expect(server.updated).toEqual([{ emailVisible: true }]));
    expect(screen.getByRole('switch', { name: 'Show my email address on my member page' })).toBeChecked();
  });

  it('asks for the permission to show notifications when they are enabled on the devices', async () => {
    startAt(ProfileStep.notifications);
    vi.stubGlobal('Notification', { permission: 'default' });
    vi.stubGlobal('PushManager', class {});
    vi.stubGlobal('__ENV__', { VITE_WEB_PUSH_PUBLIC_KEY: 'public-key' });
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {} });
    render();

    await user.click(screen.getByRole('switch', { name: 'On your devices' }));

    expect(await screen.findByRole('button', { name: 'Allow' })).toBeInTheDocument();
    expect(server.notificationDelivery).toEqual([{ email: false, push: true }]);

    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('saves the photo chosen by the member', async () => {
    startAt(ProfileStep.avatar);
    render();

    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    assert(input !== null);
    await user.upload(input, new File(['...'], 'me.png', { type: 'image/png' }));

    expect(await screen.findByText('Introduce yourself')).toBeInTheDocument();
    expect(server.updated).toEqual([{ avatarFileName: 'f1.png' }]);
  });

  it('completes the help step when the member opens the help', async () => {
    startAt(ProfileStep.help);
    render();

    await user.click(screen.getByRole('link', { name: 'Read the help' }));

    await vi.waitFor(() => expect(server.updated).toEqual([{ completedProfileSteps: [ProfileStep.help] }]));
  });

  describe('install the app', () => {
    beforeEach(() => {
      startAt(ProfileStep.installApp);
    });

    it('is shown on a phone', () => {
      device.mobile = true;
      render();

      expect(stepTitle()).toHaveTextContent('Install the app on your phone');
    });

    it('is not shown on a computer, and is left for the phone', () => {
      render();

      expect(stepTitle()).toHaveTextContent('Learn how the app works');
      expect(server.updated).toEqual([]);
    });

    it('is completed when the app runs installed on a phone', async () => {
      device.mobile = true;
      device.installed = true;
      render();

      expect(await screen.findByText('Learn how the app works')).toBeInTheDocument();
      expect(server.updated).toEqual([{ completedProfileSteps: [ProfileStep.installApp] }]);
    });
  });

  it('is not shown once every step is completed', () => {
    server.member.completedProfileSteps = Object.values(ProfileStep);
    render();

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});

class Server extends FakeServer {
  member: AuthenticatedMember = createAuthenticatedMember({ id: 'me' });
  updated: UpdateMemberProfileData[] = [];
  notificationDelivery: unknown[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(this.member));

    // Like the server: the steps are only added, and a photo completes its step.
    this.register('PUT /api/members/me/profile', ({ body }) => {
      const { completedProfileSteps = [], avatarFileName, ...data } = body as UpdateMemberProfileData;

      this.updated.push(body as UpdateMemberProfileData);
      Object.assign(this.member, data);

      if (avatarFileName) {
        this.member.avatar = avatarFileName;
        completedProfileSteps.push(ProfileStep.avatar);
      }

      this.member.completedProfileSteps = unique([
        ...this.member.completedProfileSteps,
        ...completedProfileSteps,
      ]);

      return this.noContent();
    });

    this.register('PUT /api/members/me/notification-delivery', ({ body }) => {
      this.notificationDelivery.push(body);
      Object.assign(this.member.notificationDelivery, body);

      return this.noContent();
    });

    this.register('POST /api/files/upload', ({ body }) => {
      const file = (body as FormData).get('file') as File;

      return this.json(
        { id: 'f1', name: 'f1.png', originalName: file.name, mimetype: file.type } satisfies UploadedFile,
        { status: 201 },
      );
    });
  }
}
