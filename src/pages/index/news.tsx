import { T } from '../../app/i18n.context';

import image from './image.jpg';

export const News = () => (
  <div className="col gap-2">
    <h2 className="typo-title">
      <T ns="home">News</T>
    </h2>

    <div className="card row gap-4 p-2">
      <div className="col gap-1">
        <p className="typo-subtitle">Joyeuses fêtes de fin d'année à tous !</p>

        <p>
          En cette fin d'année 2022, nous vous proposons de nous retrouver lors de la{' '}
          <strong>Bourse d'Échange Locale</strong> (BLE), le vendredi lorem ipsum dolor sit amet.
        </p>

        <p>
          Et galisum dolorem in placeat quia sed illum ipsam ex molestiae quia eum sunt voluptatem eos error
          voluptas ut tempore alias. A iure dolorum aut iste dolores ab quos pariatur ea labore perspiciatis
          est voluptas illo. Sit aperiam possimus et atque quibusdam ut nisi enim 33 totam fuga sed voluptatem
          quod aut iusto excepturi et deserunt eaque. Non soluta placeat hic quas quisquam rem esse assumenda
          in enim nemo a tenetur asperiores id quia nemo.
        </p>
      </div>

      <img src={image} alt="toto" />
    </div>

    <div className="col gap-1 rounded bg-neutral p-2 shadow">
      <p className="typo-subtitle">Compte rendu du conseil d'animation - Decembre 2022</p>

      <p>Bonjour à tous,</p>

      <p>
        Le compte-rendu du conseil d'animation est disponible dans l'espace document, aut officiis autem in
        enim quidem ea libero saepe. Cum nulla magni non illum galisum aut ipsam unde? Et dolorum voluptatem
        ab illo atque quo quas quas qui voluptas quam sed iusto dolores. Rem nesciunt autem sit unde
        praesentium a officia quia.
      </p>
    </div>
  </div>
);
