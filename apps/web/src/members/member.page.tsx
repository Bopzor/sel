import { useParams } from '@solidjs/router';
import { Component } from 'solid-js';

export const MemberPage: Component = () => {
  const { memberId } = useParams<{ memberId: string }>();
  return <>Member {memberId}</>;
};
