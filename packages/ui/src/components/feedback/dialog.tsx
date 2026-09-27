import { Dialog as ArkDialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { IconButton } from '../actions/icon-button';

export type DialogProps = Omit<ComponentProps<'div'>, 'title'> & {
  open: boolean;
  /** Called by the close button, a click on the scrim and the Escape key. */
  onClose: () => void;
  /** The question, which repeats the action ("Send 20 units to Lucas Petit?"). */
  title: ReactNode;
  /** The concrete consequences. */
  description?: ReactNode;
  /** Buttons, the main action first. */
  actions: ReactNode;
  /** Accessible name of the close button, in the application's language. */
  closeLabel: string;
  /** A destructive confirmation: role="alertdialog", and a click on the scrim does not close it. */
  alert?: boolean;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  actions,
  closeLabel,
  alert = false,
  className,
  children,
  ...props
}: DialogProps) {
  // Ark traps the focus in the window, closes it with Escape and returns the focus to the element that opened it.
  return (
    <ArkDialog.Root
      open={open}
      onOpenChange={(details) => !details.open && onClose()}
      role={alert ? 'alertdialog' : 'dialog'}
      closeOnInteractOutside={!alert}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <ArkDialog.Backdrop className="fixed inset-0 z-overlay bg-overlay data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />

        {/* A sheet at the bottom on mobile, a centered window from md. */}
        <ArkDialog.Positioner className="fixed inset-0 z-dialog flex items-end justify-center md:items-center md:p-6">
          <ArkDialog.Content
            {...props}
            className={clsx(
              'relative flex max-h-dvh w-full flex-col overflow-y-auto rounded-t-xl bg-surface-raised pb-safe-area shadow-lg md:max-w-120 md:rounded-xl md:pb-0',
              'data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in md:data-[state=closed]:animate-dialog-out md:data-[state=open]:animate-dialog-in',
              className,
            )}
          >
            <div className="flex flex-col gap-6 p-4 md:p-6">
              {/* Leaves room for the close button. */}
              <div className="flex flex-col gap-2 pr-10">
                <ArkDialog.Title className="text-title-3 text-default">{title}</ArkDialog.Title>
                {description && (
                  <ArkDialog.Description className="text-body text-muted">
                    {description}
                  </ArkDialog.Description>
                )}
              </div>

              {children}

              {/* The main action comes first: on top on mobile, on the right from md. */}
              <div className="flex flex-col gap-3 md:flex-row-reverse">{actions}</div>
            </div>

            {/* Last in the document, so that the focus goes to the content first on open (an alert dialog focuses
                this button instead, so that Enter does not confirm a destructive action by accident). Positioned by a
                wrapper: IconButton is relative, for its hit area. */}
            <div className="absolute top-3 right-3">
              <ArkDialog.CloseTrigger asChild>
                <IconButton icon="close" label={closeLabel} size="sm" />
              </ArkDialog.CloseTrigger>
            </div>
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  );
}
