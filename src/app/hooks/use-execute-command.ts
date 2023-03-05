import { Token } from 'brandi';
import { useInjection } from 'brandi-react';
import { useCallback } from 'react';

import { CommandHandler } from '../../common/cqs/command-handler';

export const useExecuteCommand = <Command>(token: Token<CommandHandler<Command>>) => {
  const handler = useInjection(token);

  return useCallback(
    (command: Command) => {
      return handler.handle(command);
    },
    [handler]
  );
};
