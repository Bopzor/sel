import { Dialog as ArkDialog, useDialogContext } from '@ark-ui/react/dialog';
import { ark } from '@ark-ui/react/factory';
import { Portal } from '@ark-ui/react/portal';
import clsx from 'clsx';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { IconButton } from '../actions/icon-button';

import type { Override } from '../../utils';

type DialogProps = {
  /** Controlled: open, and onClose to close it. Uncontrolled: a DialogTrigger opens it, a DialogClose closes it. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Called by the close button, a DialogClose, a click on the scrim and the Escape key. */
  onClose?: () => void;
  /** A destructive confirmation: role="alertdialog", and a click on the scrim does not close it. */
  alert?: boolean;
  /** The element focused on close, when it is not the button that opened the dialog. */
  finalFocus?: () => HTMLElement | null;
  children: ReactNode;
};

/** A modal window, made of a DialogContent and, optionally, the DialogTrigger that opens it. */
export function Dialog({ open, defaultOpen, onClose, alert = false, finalFocus, children }: DialogProps) {
  // Ark traps the focus in the window, closes it with Escape and returns the focus to the element that opened it.
  return (
    <ArkDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(details) => !details.open && onClose?.()}
      role={alert ? 'alertdialog' : 'dialog'}
      closeOnInteractOutside={!alert}
      finalFocusEl={finalFocus}
      lazyMount
      unmountOnExit
    >
      {children}
    </ArkDialog.Root>
  );
}

/** Wraps a Button, which gets the props that open the dialog. */
export function DialogTrigger({ children }: { children: ReactElement }) {
  return <ArkDialog.Trigger asChild>{children}</ArkDialog.Trigger>;
}

/** Wraps a Button, which gets the props that close the dialog. */
export function DialogClose({ children }: { children: ReactElement }) {
  const dialog = useDialogContext();

  // Not an Ark CloseTrigger: every CloseTrigger gets the same id, already taken by the close button, which an alert
  // dialog focuses on open.
  return (
    <ark.button asChild onClick={() => dialog.setOpen(false)}>
      {children}
    </ark.button>
  );
}

type DialogContentProps = Override<
  ComponentProps<'div'>,
  {
    /** Accessible name of the close button, in the application's language. */
    closeLabel: string;
  }
>;

/** The window, with its close button: DialogHeader, DialogBody and DialogFooter go inside. */
export function DialogContent({ closeLabel, className, children, ...props }: DialogContentProps) {
  return (
    <Portal>
      <ArkDialog.Backdrop className="fixed inset-0 z-overlay bg-overlay data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />

      {/* A sheet at the bottom on mobile, a centered window from md. */}
      <ArkDialog.Positioner className="fixed inset-0 z-dialog flex items-end justify-center md:items-center md:p-6">
        <ArkDialog.Content
          {...props}
          className={clsx(
            'relative flex max-h-4/5 w-full flex-col rounded-t-xl bg-surface-raised pb-safe-area shadow-lg md:max-h-full md:max-w-120 md:rounded-xl md:pb-0',
            'data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in md:data-[state=closed]:animate-dialog-out md:data-[state=open]:animate-dialog-in',
            className,
          )}
        >
          {/* The parts only set their horizontal padding, so that a <form className="contents"> can wrap some of
              them. The window does not scroll: a DialogBody does, and the header and the footer stay visible. */}
          <div className="flex min-h-0 flex-1 flex-col gap-6 py-4 md:py-6">{children}</div>

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
  );
}

/** The title and the description. */
export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  // The right padding leaves room for the close button.
  return <div {...props} className={clsx('flex flex-col gap-2 pr-14 pl-4 md:pr-16 md:pl-6', className)} />;
}

/** The question, which repeats the action ("Send 20 units to Lucas Petit?"). It names the dialog. */
export function DialogTitle({ className, ...props }: ComponentProps<'h2'>) {
  return <ArkDialog.Title {...props} className={clsx('text-title-3 text-default', className)} />;
}

/** The concrete consequences. It describes the dialog. */
export function DialogDescription({ className, ...props }: ComponentProps<'p'>) {
  return <ArkDialog.Description {...props} className={clsx('text-body text-muted', className)} />;
}

/** The content between the header and the footer, such as a short form. It scrolls when the window is too small. */
export function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('min-h-0 overflow-y-auto px-4 md:px-6', className)} />;
}

/** The buttons, the main action first: on top on mobile, on the right from md. */
export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={clsx('flex flex-col gap-3 px-4 md:flex-row-reverse md:px-6', className)} />
  );
}
