import clsx from 'clsx';
import type { ComponentProps } from 'react';

export type StepperProps = ComponentProps<'div'> & {
  /** Short names of the steps. */
  steps: string[];
  /** Number of the current step, starting at 1. */
  current: number;
  /** The progress in words, in the application's language: "Step 2 of 3". */
  progressLabel: string;
};

export function Stepper({ steps, current: currentProp, progressLabel, className, ...props }: StepperProps) {
  const current = Math.min(Math.max(currentProp, 1), steps.length);

  return (
    <div {...props} className={clsx('flex flex-col gap-2', className)}>
      <p className="flex flex-col">
        <span className="text-caption text-muted">{progressLabel}</span>
        <span aria-hidden className="text-title-3 text-default md:hidden">
          {steps[current - 1]}
        </span>
      </p>

      {/* Below md, only the current step's name is shown (above); the list keeps every name for screen readers. */}
      <ol className="flex gap-1">
        {steps.map((step, index) => (
          <li
            key={index}
            aria-current={index + 1 === current ? 'step' : undefined}
            className="flex flex-1 flex-col gap-2"
          >
            <span className={clsx('h-1 rounded-full', index < current ? 'bg-primary' : 'bg-track')} />
            <span
              className={clsx(
                'sr-only text-caption md:not-sr-only',
                index + 1 === current ? 'text-primary' : 'text-muted',
              )}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
