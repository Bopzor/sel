import { BackLink } from '../../app/components/back-link';

import calendarImage from './calendar.png';

export const Page = () => (
  <>
    <BackLink href="/" />

    <div className="card mx-auto max-w-[56rem] overflow-hidden">
      <img src={calendarImage} alt="placeholder calendar" />
    </div>
  </>
);
