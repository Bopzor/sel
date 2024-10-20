import { Link } from '../../components/link';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';

const T = Translate.prefix('home.createMessage');

type CreateMessageTypeSelectorProps = {
  onCreateInformation: () => void;
  onCreateNews: () => void;
};

export function CreateMessageTypeSelector(props: CreateMessageTypeSelectorProps) {
  return (
    <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      <Link unstyled href={routes.requests.create} class="card px-6 py-8 transition-shadow hover:shadow-lg">
        <div class="text-lg font-medium">
          <T id="requestTitle" />
        </div>
        <div class="text-dim">
          <T id="requestDescription" />
        </div>
      </Link>

      <Link unstyled href={routes.events.create} class="card px-6 py-8 transition-shadow hover:shadow-lg">
        <div class="text-lg font-medium">
          <T id="eventTitle" />
        </div>
        <div class="text-dim">
          <T id="eventDescription" />
        </div>
      </Link>

      <button
        type="button"
        onClick={() => props.onCreateInformation()}
        class="card px-6 py-8 text-start transition-shadow hover:shadow-lg"
      >
        <div class="text-lg font-medium">
          <T id="informationTitle" />
        </div>
        <div class="text-dim">
          <T id="informationDescription" />
        </div>
      </button>

      <button
        type="button"
        onClick={() => props.onCreateNews()}
        class="card px-6 py-8 text-start transition-shadow hover:shadow-lg"
      >
        <div class="text-lg font-medium">
          <T id="newsTitle" />
        </div>
        <div class="text-dim">
          <T id="newsDescription" />
        </div>
      </button>
    </div>
  );
}
