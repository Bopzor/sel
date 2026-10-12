import { Trans, useLingui } from '@lingui/react/macro';
import type { UpdateNotificationDeliveryData } from '@sel/shared';
import { Alert, Button, Card, RadioGroup, showToast, Switch } from '@sel/ui';
import { entries } from '@sel/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { api } from 'src/app/api';
import { colorSchemes, getColorScheme, setColorScheme, type ColorScheme } from 'src/app/color-scheme';
import { localeNames, setLocale, type Locale } from 'src/app/locale';
import { getPushPermission, registerDevice, requestPushPermission } from 'src/app/push-notifications';
import { queries } from 'src/app/queries';
import { demoStorage } from 'src/demo/storage';

export function SettingsPage() {
  return (
    <div className="stack gap-6">
      <h1 className="text-title-1">
        <Trans>Settings</Trans>
      </h1>

      <div className="mx-auto stack w-full max-w-content gap-6">
        <NotificationsSection />
        <AppearanceSection />
        <LanguageSection />
        {import.meta.env.MODE === 'demo' && <DemoSection />}
        <AppVersion />
      </div>
    </div>
  );
}

function NotificationsSection() {
  const { t } = useLingui();
  const { data: me } = useSuspenseQuery(queries.session());
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: me.notificationDelivery,
  });

  const push = useWatch({ control: form.control, name: 'push' });

  const mutation = useMutation({
    mutationFn: (body: UpdateNotificationDeliveryData) => {
      return api('PUT', `/members/${me.id}/notification-delivery`, { body });
    },
    onSuccess: (_, body) => {
      if (body.push && getPushPermission() === 'granted') {
        registerDevice().catch(() => {
          showToast(
            t`Notifications couldn't be enabled on this device. Try again in a few moments.`,
            'error',
          );
        });
      }
    },
    onError: () => {
      showToast(t`The notification settings couldn't be saved`, 'error');
      form.reset(me.notificationDelivery);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(queries.session());
    },
  });

  const changeHandler = (field: 'email' | 'push', onChange: (event: React.ChangeEvent) => void) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event);
      mutation.mutate({ ...form.getValues(), [field]: event.target.checked });
    };
  };

  return (
    <SettingsSection
      title={<Trans>Notifications</Trans>}
      description={<Trans>How you keep up with the activity of the LETS.</Trans>}
    >
      <div className="stack gap-6">
        <Controller
          control={form.control}
          name="email"
          render={({ field: { value, onChange, ...field } }) => (
            <Switch
              label={<Trans>By email</Trans>}
              description={<Trans>Notifications are sent to your email address.</Trans>}
              checked={value}
              onChange={changeHandler('email', onChange)}
              {...field}
            />
          )}
        />

        <Controller
          control={form.control}
          name="push"
          render={({ field: { value, onChange, ...field } }) => (
            <Switch
              label={<Trans>On your devices</Trans>}
              description={
                <Trans>
                  Notifications appear on the devices where you allowed them, even when the app is closed.
                </Trans>
              }
              checked={value}
              onChange={changeHandler('push', onChange)}
              {...field}
            />
          )}
        />

        {push && <DeviceRegistration />}
      </div>
    </SettingsSection>
  );
}

function DeviceRegistration() {
  const { t } = useLingui();
  const [permission, setPermission] = useState(getPushPermission);

  const mutation = useMutation({
    mutationFn: requestPushPermission,
    onSuccess: (permission) => {
      setPermission(permission);

      if (permission === 'granted') {
        showToast(t`This device will receive notifications`);
      }
    },
    onError: () =>
      showToast(t`Notifications couldn't be enabled on this device. Try again in a few moments.`, 'error'),
  });

  if (permission === 'default') {
    return (
      <Alert.Root tone="info">
        <Alert.Title>
          <Trans>This device doesn't receive notifications yet</Trans>
        </Alert.Title>
        <Alert.Description>
          <Trans>Allow notifications to receive them here too.</Trans>
        </Alert.Description>
        <Alert.Actions>
          <Button
            size="sm"
            variant="secondary"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <Trans>Allow on this device</Trans>
          </Button>
        </Alert.Actions>
      </Alert.Root>
    );
  }

  if (permission === 'denied') {
    return (
      <Alert.Root tone="warning">
        <Alert.Description>
          <Trans>
            Notifications are blocked on this device. To receive them, allow them in the browser settings.
          </Trans>
        </Alert.Description>
      </Alert.Root>
    );
  }

  if (permission === 'unsupported') {
    return (
      <Alert.Root tone="info">
        <Alert.Description>
          <Trans>
            This browser can't receive notifications. On an iPhone, first add the app to the home screen.
          </Trans>
        </Alert.Description>
      </Alert.Root>
    );
  }

  return null;
}

function AppearanceSection() {
  const titleId = useId();
  const [scheme, setScheme] = useState(getColorScheme);

  const labels: Record<ColorScheme, React.ReactNode> = {
    light: <Trans>Light</Trans>,
    dark: <Trans>Dark</Trans>,
    system: <Trans>Same as the device</Trans>,
  };

  const handleChange = (value: string) => {
    setColorScheme(value as ColorScheme);
    setScheme(value as ColorScheme);
  };

  return (
    <SettingsSection
      titleId={titleId}
      title={<Trans>Appearance</Trans>}
      description={<Trans>Applies to this device only.</Trans>}
    >
      <RadioGroup.Root aria-labelledby={titleId} value={scheme} onChange={handleChange}>
        {colorSchemes.map((scheme) => (
          <RadioGroup.Item key={scheme} value={scheme} label={labels[scheme]} />
        ))}
      </RadioGroup.Root>
    </SettingsSection>
  );
}

function LanguageSection() {
  const titleId = useId();
  const { i18n } = useLingui();

  return (
    <SettingsSection
      titleId={titleId}
      title={<Trans>Language</Trans>}
      description={<Trans>Applies to this device only.</Trans>}
    >
      <RadioGroup.Root
        aria-labelledby={titleId}
        value={i18n.locale}
        onChange={(locale) => setLocale(locale as Locale)}
      >
        {entries(localeNames).map(([locale, name]) => (
          <RadioGroup.Item key={locale} value={locale} label={name} lang={locale} />
        ))}
      </RadioGroup.Root>
    </SettingsSection>
  );
}

function DemoSection() {
  const { t } = useLingui();

  const mutation = useMutation({
    mutationFn: () => demoStorage.clear(),
    // A full page load creates the demo data again from the seed.
    onSuccess: () => window.location.assign(import.meta.env.BASE_URL),
    onError: () => showToast(t`The demo data couldn't be reset`, 'error'),
  });

  return (
    <SettingsSection
      title={<Trans>Demo</Trans>}
      description={<Trans>Your changes are only kept in this browser.</Trans>}
    >
      <div className="stack items-start gap-4">
        <p>
          <Trans>Resetting brings back the demo data as it was on your first visit.</Trans>
        </p>

        <Button variant="secondary" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          <Trans>Reset the demo data</Trans>
        </Button>
      </div>
    </SettingsSection>
  );
}

function AppVersion() {
  const version = __APP_VERSION__;

  return (
    <p className="text-center text-caption text-subtle">
      <Trans>Version {version}</Trans>
    </p>
  );
}

type SettingsSectionProps = {
  titleId?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
};

function SettingsSection({ titleId, title, description, children }: SettingsSectionProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2} id={titleId}>
          {title}
        </Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Header>

      <Card.Body>{children}</Card.Body>
    </Card.Root>
  );
}
