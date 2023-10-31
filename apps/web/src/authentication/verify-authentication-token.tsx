import { Component, onMount } from 'solid-js';

import { store } from '../store/store';

import { verifyAuthenticationToken } from './use-cases/verify-authentication-token/verify-authentication-token';

type VerifyAuthenticationTokenProps = {
  token: string;
  onVerified: () => void;
};

export const VerifyAuthenticationToken: Component<VerifyAuthenticationTokenProps> = (props) => {
  onMount(() => {
    const verify = async () => {
      try {
        await store.dispatch(verifyAuthenticationToken(props.token));
      } finally {
        props.onVerified();
      }
    };

    void verify();
  });

  return <>loading...</>;
};
