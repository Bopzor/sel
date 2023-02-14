import logo from './logo.png';

export const PageHeader = () => (
  <header className="bg-primary py-1 text-inverted">
    <div className="content row items-center">
      <div className="row mr-auto items-center gap-2">
        <img src={logo} alt="Logo" width={64} height={64} />
        <span className="text-xl font-semibold">Système d'Échange Local</span>
      </div>

      <div className="col items-center">
        <div className="h-3 w-3 rounded-full bg-neutral/80" />
        <span className="font-medium">Nils</span>
      </div>
    </div>
  </header>
);
