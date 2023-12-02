import { useLocation, useNavigate } from '@solidjs/router';
import { injectableClass } from 'ditox';

import { RouterPort } from './router.port';

export class SolidRouterAdapter implements RouterPort {
  static inject = injectableClass(this);

  get location() {
    return useLocation();
  }

  navigate = useNavigate();
}
