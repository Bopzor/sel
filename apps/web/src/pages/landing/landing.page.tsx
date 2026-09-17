import { useNavigate } from '@solidjs/router';
import { createEffect, Show } from 'solid-js';

import { queryAuthenticatedMember } from 'src/application/query';
import { SpinnerFullScreen } from 'src/components/spinner';

import { Hero } from './01-hero';
import { Overview } from './02-overview';
import { How } from './03-how';
import { Infos } from './04-infos';
import { Footer } from './components/footer';
import { Header } from './components/header';

export function LandingPage() {
  const member = queryAuthenticatedMember();
  const navigate = useNavigate();

  createEffect(() => {
    if (member.isSuccess) {
      navigate('/home');
    }
  });

  return (
    <Show when={!member.isPending} fallback={<SpinnerFullScreen />}>
      <Header />
      <Main />
      <Footer />
    </Show>
  );
}

function Main() {
  return (
    <main class="mx-auto max-w-6xl px-6 font-nunito text-xl sm:text-lg">
      <Hero />
      <Overview />
      <How />
      <Infos />
    </main>
  );
}
