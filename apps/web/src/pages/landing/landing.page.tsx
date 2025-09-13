import { Hero } from './01-hero';
import { Overview } from './02-overview';
import { How } from './03-how';
import { Infos } from './04-infos';
import { Footer } from './components/footer';
import { Header } from './components/header';

export function LandingPage() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
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
