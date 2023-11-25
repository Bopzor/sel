import { Component } from 'solid-js';

import { Translate } from '../intl/translate';

const T = Translate.prefix('profile.notifications');

export const ProfileNotificationsPage: Component = () => {
  return (
    <>
      <h1>
        <T id="title" />
      </h1>

      <p>
        <T id="description" />
      </p>
    </>
  );
};
