import { Trans, useLingui } from '@lingui/react/macro';
import type { UpdateNotificationDeliveryData } from '@sel/shared';
import { Card, RadioGroup, showToast, Switch } from '@sel/ui';
import { entries } from '@sel/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { api } from 'src/app/api';
import { colorSchemes, getColorScheme, setColorScheme, type ColorScheme } from 'src/app/color-scheme';
import { localeNames, setLocale, type Locale } from 'src/app/locale';
import { queries } from 'src/app/queries';

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

  const mutation = useMutation({
    mutationFn: (body: UpdateNotificationDeliveryData) => {
      return api('PUT', `/members/${me.id}/notification-delivery`, { body });
    },
    onError: () => {
      showToast(t`The notification settings could not be saved`, 'error');
      form.reset(me.notificationDelivery);
    },
    // Awaited, so that the switches show the pending values until the session is refetched.
    onSettled: () => queryClient.invalidateQueries(queries.session()),
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
      description={<Trans>How you are told about the activity of the LETS.</Trans>}
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
              label={<Trans>Push notifications</Trans>}
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
      </div>
    </SettingsSection>
  );
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
